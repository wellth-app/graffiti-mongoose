'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSchema = exports.getFields = exports.getMutationField = exports.getQueryField = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _graphql = require('graphql');

var _graphqlRelay = require('graphql-relay');

var _model = require('./../model');

var _model2 = _interopRequireDefault(_model);

var _type = require('./../type');

var _type2 = _interopRequireDefault(_type);

var _query = require('./../query');

var _query2 = _interopRequireDefault(_query);

var _utils = require('../utils');

var _viewer = require('../model/viewer');

var _viewer2 = _interopRequireDefault(_viewer);

var _utils2 = require('mongoose/lib/utils');

var _toInputObject = require('../type/custom/to-input-object');

var _toInputObject2 = _interopRequireDefault(_toInputObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var idField = {
  name: 'id',
  type: new _graphql.GraphQLNonNull(_graphql.GraphQLID)
};

function getSingularQueryField(graffitiModel, type) {
  var hooks = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var name = type.name;
  var singular = hooks.singular;

  var singularName = name.toLowerCase();

  return _defineProperty({}, singularName, {
    type: type,
    args: {
      id: idField
    },
    resolve: (0, _utils.addHooks)(_query2.default.getOneResolver(graffitiModel), singular)
  });
}

function getPluralQueryField(graffitiModel, type) {
  var hooks = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var name = type.name;
  var plural = hooks.plural;

  var pluralName = (0, _utils2.toCollectionName)(name);

  return _defineProperty({}, pluralName, {
    type: new _graphql.GraphQLList(type),
    args: (0, _type.getArguments)(type, {
      id: {
        type: new _graphql.GraphQLList(_graphql.GraphQLID),
        description: 'The ID of a ' + name
      },
      ids: {
        type: new _graphql.GraphQLList(_graphql.GraphQLID),
        description: 'The ID of a ' + name
      }
    }),
    resolve: (0, _utils.addHooks)(_query2.default.getListResolver(graffitiModel), plural)
  });
}

function getQueryField(graffitiModel, type, hooks) {
  return _extends({}, getSingularQueryField(graffitiModel, type, hooks), getPluralQueryField(graffitiModel, type, hooks));
}

function getConnectionField(graffitiModel, type) {
  var hooks = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var name = type.name;
  var plural = hooks.plural;

  var pluralName = (0, _utils2.toCollectionName)(name.toLowerCase());

  var _connectionDefinition = (0, _graphqlRelay.connectionDefinitions)({ name: name, nodeType: type, connectionFields: {
      count: {
        name: 'count',
        type: _graphql.GraphQLFloat
      }
    } });

  var connectionType = _connectionDefinition.connectionType;


  return _defineProperty({}, pluralName, {
    args: (0, _type.getArguments)(type, _graphqlRelay.connectionArgs),
    type: connectionType,
    resolve: (0, _utils.addHooks)(function (rootValue, args, info) {
      return (0, _query.connectionFromModel)(graffitiModel, args, info);
    }, plural)
  });
}

function getMutationField(graffitiModel, type, viewer) {
  var _ref4;

  var hooks = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
  var allowMongoIDMutation = arguments[4];
  var name = type.name;
  var mutation = hooks.mutation;


  var fields = (0, _type.getTypeFields)(type);
  var inputFields = (0, _lodash.reduce)(fields, function (inputFields, field) {
    if (field.type instanceof _graphql.GraphQLObjectType) {
      if (field.type.name.endsWith('Connection')) {
        inputFields[field.name] = {
          name: field.name,
          type: new _graphql.GraphQLList(_graphql.GraphQLID)
        };
      } else if (field.type.mongooseEmbedded || field.type.mongooseNested) {
        inputFields[field.name] = {
          name: field.name,
          type: (0, _toInputObject2.default)(field.type)
        };
      } else {
        inputFields[field.name] = {
          name: field.name,
          type: _graphql.GraphQLID
        };
      }
    }

    if (field.type instanceof _graphql.GraphQLList && field.type.ofType instanceof _graphql.GraphQLObjectType) {
      inputFields[field.name] = {
        name: field.name,
        type: new _graphql.GraphQLList((0, _toInputObject2.default)(field.type.ofType))
      };
    } else if (!(field.type instanceof _graphql.GraphQLObjectType) && field.name !== 'id' && !field.name.startsWith('__') && (allowMongoIDMutation || field.name !== '_id')) {
      inputFields[field.name] = field;
    }

    return inputFields;
  }, {});

  var updateInputFields = (0, _lodash.reduce)(fields, function (inputFields, field) {
    if (field.type instanceof _graphql.GraphQLObjectType && field.type.name.endsWith('Connection')) {
      inputFields[field.name + '_add'] = {
        name: field.name,
        type: new _graphql.GraphQLList(_graphql.GraphQLID)
      };
    }

    return inputFields;
  }, {});

  var changedName = 'changed' + name;
  var edgeName = changedName + 'Edge';
  var nodeName = changedName + 'Node';

  var addName = 'add' + name;
  var updateName = 'update' + name;
  var deleteName = 'delete' + name;

  return _ref4 = {}, _defineProperty(_ref4, addName, (0, _graphqlRelay.mutationWithClientMutationId)({
    name: addName,
    inputFields: inputFields,
    outputFields: _defineProperty({
      viewer: viewer
    }, edgeName, {
      type: (0, _graphqlRelay.connectionDefinitions)({ name: changedName, nodeType: new _graphql.GraphQLObjectType({
          name: nodeName,
          fields: fields
        }) }).edgeType,
      resolve: function resolve(node) {
        return {
          node: node,
          cursor: (0, _query.idToCursor)(node.id)
        };
      }
    }),
    mutateAndGetPayload: (0, _utils.addHooks)(_query2.default.getAddOneMutateHandler(graffitiModel), mutation)
  })), _defineProperty(_ref4, updateName, (0, _graphqlRelay.mutationWithClientMutationId)({
    name: updateName,
    inputFields: _extends({}, inputFields, updateInputFields, {
      id: idField
    }),
    outputFields: _defineProperty({}, changedName, {
      type: type,
      resolve: function resolve(node) {
        return node;
      }
    }),
    mutateAndGetPayload: (0, _utils.addHooks)(_query2.default.getUpdateOneMutateHandler(graffitiModel), mutation)
  })), _defineProperty(_ref4, deleteName, (0, _graphqlRelay.mutationWithClientMutationId)({
    name: deleteName,
    inputFields: {
      id: idField
    },
    outputFields: {
      viewer: viewer,
      ok: {
        type: _graphql.GraphQLBoolean
      },
      id: idField
    },
    mutateAndGetPayload: (0, _utils.addHooks)(_query2.default.getDeleteOneMutateHandler(graffitiModel), mutation)
  })), _ref4;
}

/**
 * Returns query and mutation root fields
 * @param  {Array} graffitiModels
 * @param  {{Object, Boolean}} {hooks, mutation, allowMongoIDMutation}
 * @return {Object}
 */
function getFields(graffitiModels) {
  var _ref5 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref5$hooks = _ref5.hooks;
  var hooks = _ref5$hooks === undefined ? {} : _ref5$hooks;
  var _ref5$mutation = _ref5.mutation;
  var mutation = _ref5$mutation === undefined ? true : _ref5$mutation;
  var _ref5$allowMongoIDMut = _ref5.allowMongoIDMutation;
  var allowMongoIDMutation = _ref5$allowMongoIDMut === undefined ? false : _ref5$allowMongoIDMut;
  var _ref5$customQueries = _ref5.customQueries;
  var customQueries = _ref5$customQueries === undefined ? {} : _ref5$customQueries;
  var _ref5$customMutations = _ref5.customMutations;
  var customMutations = _ref5$customMutations === undefined ? {} : _ref5$customMutations;
  var _ref5$rebuildCache = _ref5.rebuildCache;
  var rebuildCache = _ref5$rebuildCache === undefined ? true : _ref5$rebuildCache;

  var types = _type2.default.getTypes(graffitiModels, rebuildCache);
  var viewer = hooks.viewer;
  var singular = hooks.singular;


  var viewerFields = (0, _lodash.reduce)(types, function (fields, type, key) {
    type.name = type.name || key;
    var graffitiModel = graffitiModels[type.name];
    return _extends({}, fields, getConnectionField(graffitiModel, type, hooks), getSingularQueryField(graffitiModel, type, hooks));
  }, {
    id: (0, _graphqlRelay.globalIdField)('Viewer')
  });
  (0, _type.setTypeFields)(_type.GraphQLViewer, viewerFields);

  var viewerField = {
    name: 'Viewer',
    type: _type.GraphQLViewer,
    resolve: (0, _utils.addHooks)(function () {
      return _viewer2.default;
    }, viewer)
  };

  var _reduce = (0, _lodash.reduce)(types, function (_ref6, type, key) {
    var queries = _ref6.queries;
    var mutations = _ref6.mutations;

    type.name = type.name || key;
    var graffitiModel = graffitiModels[type.name];
    return {
      queries: _extends({}, queries, getQueryField(graffitiModel, type, hooks)),
      mutations: _extends({}, mutations, getMutationField(graffitiModel, type, viewerField, hooks, allowMongoIDMutation))
    };
  }, {
    queries: customQueries,
    mutations: customMutations
  });

  var queries = _reduce.queries;
  var mutations = _reduce.mutations;


  var RootQuery = new _graphql.GraphQLObjectType({
    name: 'RootQuery',
    fields: _extends({
      viewer: viewerField,
      node: {
        name: 'node',
        description: 'Fetches an object given its ID',
        type: _type.nodeInterface,
        args: {
          id: {
            type: new _graphql.GraphQLNonNull(_graphql.GraphQLID),
            description: 'The ID of an object'
          }
        },
        resolve: (0, _utils.addHooks)((0, _query.getIdFetcher)(graffitiModels), singular)
      }
    }, queries)
  });

  var RootMutation = new _graphql.GraphQLObjectType({
    name: 'RootMutation',
    fields: mutations
  });

  var fields = {
    query: RootQuery
  };

  if (mutation) {
    fields.mutation = RootMutation;
  }

  return fields;
}

/**
 * Returns a GraphQL schema including query and mutation fields
 * @param  {Array} mongooseModels
 * @param  {Object} options
 * @return {GraphQLSchema}
 */
function getSchema(mongooseModels, options) {
  if (!(0, _lodash.isArray)(mongooseModels)) {
    mongooseModels = [mongooseModels];
  }
  var graffitiModels = _model2.default.getModels(mongooseModels);
  var fields = getFields(graffitiModels, options);
  return new _graphql.GraphQLSchema(fields);
}

exports.getQueryField = getQueryField;
exports.getMutationField = getMutationField;
exports.getFields = getFields;
exports.getSchema = getSchema;
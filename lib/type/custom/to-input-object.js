'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _schema = require('../../schema/schema');

var _graphql = require('graphql');

/**
 * Detailed explanation https://github.com/graphql/graphql-js/issues/312#issuecomment-196169994
 */

var cachedTypes = {};

function createInputObject(type) {
  var typeName = type.name + 'Input';

  if (!cachedTypes.hasOwnProperty(typeName)) {
    cachedTypes[typeName] = new _graphql.GraphQLInputObjectType({
      name: typeName,
      fields: {}
    });
    cachedTypes[typeName]._typeConfig.fields = function () {
      return filterFields(type.getFields(), function (field) {
        return !field.noInputObject;
      });
    }; // eslint-disable-line
  }

  return cachedTypes[typeName];
}

function filterFields(obj, filter) {
  var result = {};
  Object.keys(obj).forEach(function (key) {
    if (filter(obj[key])) {
      result[key] = convertInputObjectField(obj[key]); // eslint-disable-line no-use-before-define
    }
  });
  return result;
}

function convertInputObjectField(field) {
  var fieldType = field.type;
  var wrappers = [];

  while (fieldType.ofType) {
    wrappers.unshift(fieldType.constructor);
    fieldType = fieldType.ofType;
  }

  if (!(fieldType instanceof _graphql.GraphQLInputObjectType || fieldType instanceof _graphql.GraphQLScalarType || fieldType instanceof _graphql.GraphQLEnumType)) {
    fieldType = fieldType.getInterfaces().includes(_schema.nodeInterface) ? _graphql.GraphQLID : createInputObject(fieldType);
  }

  fieldType = wrappers.reduce(function (type, Wrapper) {
    return new Wrapper(type);
  }, fieldType);

  return { type: fieldType };
}

exports.default = createInputObject;
'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _defineProperty2 = require('babel-runtime/core-js/object/define-property');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                      * Detailed explanation https://github.com/graphql/graphql-js/issues/312#issuecomment-196169994
                                                                                                                                                                                                                                                                      */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _graphql = require('graphql');

var _schema = require('../../schema/schema');

function _defineProperty(obj, key, value) { if (key in obj) { (0, _defineProperty3.default)(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function filterFields(obj, filter) {
  return (0, _keys2.default)(obj).filter(filter).reduce(function (result, key) {
    return _extends({}, result, _defineProperty({}, key, convertInputObjectField(obj[key])));
  }, {});
}

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

function convertInputObjectField(field) {
  var fieldType = field.type;
  var wrappers = [];

  while (fieldType.ofType) {
    wrappers.unshift(fieldType.constructor);
    fieldType = fieldType.ofType;
  }

  if (!(fieldType instanceof _graphql.GraphQLInputObjectType || fieldType instanceof _graphql.GraphQLScalarType || fieldType instanceof _graphql.GraphQLEnumType)) {
    fieldType = fieldType.getInterfaces().indexOf(_schema.nodeInterface) !== -1 ? _graphql.GraphQLID : createInputObject(fieldType);
  }

  fieldType = wrappers.reduce(function (type, Wrapper) {
    return new Wrapper(type);
  }, fieldType);

  return { type: fieldType };
}

exports.default = createInputObject;
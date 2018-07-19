'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _graphql = require('graphql');

var _language = require('graphql/language');

function coerceDate(value) {
  var json = (0, _stringify2.default)(value);
  return json.replace(/\"/g, '\''); // eslint-disable-line
}

exports.default = new _graphql.GraphQLScalarType({
  name: 'Generic',
  serialize: coerceDate,
  parseValue: coerceDate,
  parseLiteral: function parseLiteral(ast) {
    if (ast.kind !== _language.Kind.STRING) {
      throw new _graphql.GraphQLError('Query error: Can only parse strings to buffers but got a: ' + ast.kind, [ast]);
    }

    var json = ast.value.replace(/\'/g, '"'); // eslint-disable-line
    return JSON.parse(json);
  }
});
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _graphql = require('graphql');

var _language = require('graphql/language');

function coerceDate(value) {
  var json = JSON.stringify(value);
  return json.replace(/\"/g, '\'');
}

exports.default = new _graphql.GraphQLScalarType({
  name: 'Generic',
  serialize: coerceDate,
  parseValue: coerceDate,
  parseLiteral: function parseLiteral(ast) {
    if (ast.kind !== _language.Kind.STRING) {
      throw new _graphql.GraphQLError('Query error: Can only parse strings to buffers but got a: ' + ast.kind, [ast]);
    }

    var json = ast.value.replace(/\'/g, '"');
    return JSON.parse(json);
  }
});
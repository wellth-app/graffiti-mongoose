'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _graphql = require('graphql');

var _error = require('graphql/error');

var _language = require('graphql/language');

function coerceBuffer(value) {
  if (!(value instanceof Buffer)) {
    throw new TypeError('Field error: value is not an instance of Buffer');
  }

  return value.toString();
}

exports.default = new _graphql.GraphQLScalarType({
  name: 'Buffer',
  serialize: coerceBuffer,
  parseValue: coerceBuffer,
  parseLiteral: function parseLiteral(ast) {
    if (ast.kind !== _language.Kind.STRING) {
      throw new _error.GraphQLError('Query error: Can only parse strings to buffers but got a: ' + ast.kind, [ast]);
    }

    var result = new Buffer(ast.value);

    if (ast.value !== result.toString()) {
      throw new _error.GraphQLError('Query error: Invalid buffer encoding', [ast]);
    }

    return result;
  }
});
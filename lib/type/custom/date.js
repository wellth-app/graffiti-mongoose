'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _graphql = require('graphql');

var _error = require('graphql/error');

var _language = require('graphql/language');

exports.default = new _graphql.GraphQLScalarType({
  name: 'Date',
  serialize: function serialize(value) {
    if (!(value instanceof Date)) {
      throw new TypeError('Field error: value is not an instance of Date');
    }

    if (isNaN(value.getTime())) {
      throw new TypeError('Field error: value is an invalid Date');
    }

    return value.toJSON();
  },
  parseValue: function parseValue(value) {
    var date = new Date(value);

    if (isNaN(date.getTime())) {
      throw new TypeError('Field error: value is an invalid Date');
    }

    return date;
  },
  parseLiteral: function parseLiteral(ast) {
    if (ast.kind !== _language.Kind.STRING) {
      throw new _error.GraphQLError('Query error: Can only parse strings to buffers but got a: ' + ast.kind, [ast]);
    }

    var result = new Date(ast.value);
    if (isNaN(result.getTime())) {
      throw new _error.GraphQLError('Query error: Invalid date', [ast]);
    }

    if (ast.value !== result.toJSON()) {
      throw new _error.GraphQLError('Query error: Invalid date format, only accepts: YYYY-MM-DDTHH:MM:SS.SSSZ', [ast]);
    }

    return result;
  }
});
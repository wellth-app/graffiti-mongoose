'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GraphQLViewer = exports.GraphQLGeneric = exports.GraphQLDate = exports.GraphQLBuffer = exports.getTypes = exports.getSchema = exports.graphql = undefined;

var _graphql = require('graphql');

var _type = require('./type');

var _schema = require('./schema');

var _model = require('./model');

function _getTypes(mongooseModels) {
  var graffitiModels = (0, _model.getModels)(mongooseModels);
  return (0, _type.getTypes)(graffitiModels);
}

exports.default = {
  graphql: _graphql.graphql,
  getSchema: _schema.getSchema,
  getTypes: _getTypes,
  GraphQLBuffer: _type.GraphQLBuffer,
  GraphQLDate: _type.GraphQLDate,
  GraphQLGeneric: _type.GraphQLGeneric,
  GraphQLViewer: _type.GraphQLViewer
};
exports.graphql = _graphql.graphql;
exports.getSchema = _schema.getSchema;
exports.getTypes = _getTypes;
exports.GraphQLBuffer = _type.GraphQLBuffer;
exports.GraphQLDate = _type.GraphQLDate;
exports.GraphQLGeneric = _type.GraphQLGeneric;
exports.GraphQLViewer = _type.GraphQLViewer;
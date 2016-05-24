'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getModels = exports.getModel = exports.extractPaths = exports.extractPath = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var embeddedModels = {};

/**
 * @method getField
 * @param schemaPaths
 * @return {Object} field
 */
function getField(schemaPath) {
  var _ref = schemaPath.options || {};

  var description = _ref.description;
  var hidden = _ref.hidden;
  var hooks = _ref.hooks;
  var ref = _ref.ref;
  var index = _ref.index;

  var name = schemaPath.path.split('.').pop();

  var field = {
    name: name,
    description: description,
    hidden: hidden,
    hooks: hooks,
    type: schemaPath.instance,
    nonNull: !!index
  };

  if (schemaPath.enumValues && schemaPath.enumValues.length > 0) {
    field.enumValues = schemaPath.enumValues;
  }

  // ObjectID ref
  if (ref) {
    field.reference = ref;
  }

  // Caster
  if (schemaPath.caster) {
    var _schemaPath$caster = schemaPath.caster;
    var instance = _schemaPath$caster.instance;
    var options = _schemaPath$caster.options;
    var enumValues = _schemaPath$caster.enumValues;

    var _ref3 = options || {};

    var _ref2 = _ref3.ref;


    field.subtype = instance;
    if (enumValues && enumValues.length > 0) {
      field.enumValues = enumValues;
    }

    // ObjectID ref
    if (_ref2) {
      field.reference = _ref2;
    }
  }

  return field;
}

/**
 * Extracts tree chunk from path if it's a sub-document
 * @method extractPath
 * @param {Object} schemaPath
 * @param {Object} model
 * @return {Object} field
 */
function extractPath(schemaPath) {
  var subs = schemaPath.path.split('.');
  var subNames = schemaPath.path.split('.');

  return (0, _lodash.reduceRight)(subs, function (field, sub, key) {
    var obj = {};

    if (schemaPath instanceof _mongoose2.default.Schema.Types.DocumentArray && key === subs.length - 1) {
      var subSchemaPaths = schemaPath.schema.paths;
      var fields = extractPaths(subSchemaPaths, { name: sub }); // eslint-disable-line no-use-before-define
      obj[sub] = {
        name: sub,
        nonNull: false,
        type: 'Array',
        subtype: 'Object',
        fields: fields
      };
    } else if (schemaPath instanceof _mongoose2.default.Schema.Types.Embedded) {
      schemaPath.modelName = schemaPath.schema.options.graphqlTypeName || sub;
      // embedded model must be unique Instance
      var embeddedModel = embeddedModels.hasOwnProperty(schemaPath.modelName) ? embeddedModels[schemaPath.modelName] : getModel(schemaPath); // eslint-disable-line no-use-before-define

      embeddedModels[schemaPath.modelName] = embeddedModel;
      obj[sub] = _extends({}, getField(schemaPath), {
        embeddedModel: embeddedModel
      });
    } else if (key === subs.length - 1) {
      obj[sub] = getField(schemaPath);
    } else {
      obj[sub] = {
        name: sub,
        nonNull: false,
        type: 'Object',
        fields: field
      };
    }

    subNames.pop();

    return obj;
  }, {});
}

/**
 * Merge sub-document tree chunks
 * @method extractPaths
 * @param {Object} schemaPaths
 * @param {Object} model
 * @return {Object) extractedSchemaPaths
 */
function extractPaths(schemaPaths, model) {
  return (0, _lodash.reduce)(schemaPaths, function (fields, schemaPath) {
    return (0, _lodash.merge)(fields, extractPath(schemaPath, model));
  }, {});
}

/**
 * Turn mongoose model to graffiti model
 * @method getModel
 * @param {Object} model Mongoose model
 * @return {Object} graffiti model
 */
function getModel(model) {
  var schemaPaths = model.schema.paths;
  var name = model.modelName;

  var fields = extractPaths(schemaPaths, { name: name });

  return {
    name: name,
    fields: fields,
    model: model
  };
}

/**
 * @method getModels
 * @param {Array} mongooseModels
 * @return {Object} - graffiti models
 */
function getModels(mongooseModels) {
  return mongooseModels.map(getModel).reduce(function (models, model) {
    models[model.name] = model;
    return models;
  }, {});
}

exports.default = {
  getModels: getModels
};
exports.extractPath = extractPath;
exports.extractPaths = extractPaths;
exports.getModel = getModel;
exports.getModels = getModels;
'use strict';

var _defineProperty2 = require('babel-runtime/core-js/object/define-property');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getModels = exports.getModel = exports.extractPaths = exports.extractPath = undefined;

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { (0, _defineProperty3.default)(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var embeddedModels = {};

/**
 * @method getField
 * @param schemaPaths
 * @return {Object} field
 */
function getField(schemaPath) {
  var _ref = schemaPath.options || {},
      description = _ref.description,
      hidden = _ref.hidden,
      hooks = _ref.hooks,
      ref = _ref.ref,
      index = _ref.index;

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
    var _schemaPath$caster = schemaPath.caster,
        instance = _schemaPath$caster.instance,
        options = _schemaPath$caster.options,
        enumValues = _schemaPath$caster.enumValues;

    var _ref3 = options || {},
        _ref2 = _ref3.ref;

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
  var subNames = schemaPath.path.split('.');

  return (0, _lodash.reduceRight)(subNames, function (fields, name, key) {
    var obj = {};

    if (schemaPath instanceof _mongoose2.default.Schema.Types.DocumentArray && key === subNames.length - 1) {
      var subSchemaPaths = schemaPath.schema.paths;
      var _fields = extractPaths(subSchemaPaths, { name: name }); // eslint-disable-line no-use-before-define
      obj[name] = {
        name: name,
        fields: _fields,
        nonNull: false,
        type: 'Array',
        subtype: 'Object'
      };
    } else if (schemaPath instanceof _mongoose2.default.Schema.Types.Embedded) {
      schemaPath.modelName = schemaPath.schema.options.graphqlTypeName || name;
      // embedded model must be unique Instance
      var embeddedModel = embeddedModels.hasOwnProperty(schemaPath.modelName) ? embeddedModels[schemaPath.modelName] : getModel(schemaPath); // eslint-disable-line no-use-before-define

      embeddedModels[schemaPath.modelName] = embeddedModel;
      obj[name] = _extends({}, getField(schemaPath), {
        embeddedModel: embeddedModel
      });
    } else if (key === subNames.length - 1) {
      obj[name] = getField(schemaPath);
    } else {
      obj[name] = {
        name: name,
        fields: fields,
        nonNull: false,
        type: 'Object'
      };
    }

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
    return _extends({}, models, _defineProperty({}, model.name, model));
  }, {});
}

exports.default = {
  getModels: getModels
};
exports.extractPath = extractPath;
exports.extractPaths = extractPaths;
exports.getModel = getModel;
exports.getModels = getModels;
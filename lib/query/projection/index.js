'use strict';

var _defineProperty2 = require('babel-runtime/core-js/object/define-property');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { (0, _defineProperty3.default)(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getFieldList(info, fieldNodes) {
  if (!info) {
    return {};
  }

  fieldNodes = fieldNodes || info.fieldNodes;

  // for recursion
  // Fragments doesn't have many sets
  var nodes = fieldNodes;
  if (!Array.isArray(nodes)) {
    nodes = nodes ? [nodes] : [];
  }

  // get all selectionSets
  var selections = nodes.reduce(function (selections, source) {
    if (source.selectionSet) {
      return selections.concat(source.selectionSet.selections);
    }

    return selections;
  }, []);

  // return fields
  return selections.reduce(function (list, ast) {
    var name = ast.name,
        kind = ast.kind;


    switch (kind) {
      case 'Field':
        return _extends({}, list, getFieldList(info, ast), _defineProperty({}, name.value, true));
      case 'InlineFragment':
        return _extends({}, list, getFieldList(info, ast));
      case 'FragmentSpread':
        return _extends({}, list, getFieldList(info, info.fragments[name.value]));
      default:
        throw new Error('Unsuported query selection');
    }
  }, {});
}

exports.default = getFieldList;
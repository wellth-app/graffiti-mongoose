'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = getFieldList;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function getFieldList(context, fieldASTs) {
  if (!context) {
    return {};
  }

  fieldASTs = fieldASTs || context.fieldASTs;

  // for recursion
  // Fragments doesn't have many sets
  var asts = fieldASTs;
  if (!Array.isArray(asts)) {
    asts = [asts];
  }

  // get all selectionSets
  var selections = asts.reduce(function (selections, source) {
    if (source.selectionSet) {
      selections.push.apply(selections, _toConsumableArray(source.selectionSet.selections));
    }

    return selections;
  }, []);

  // return fields
  return selections.reduce(function (list, ast) {
    var name = ast.name;
    var kind = ast.kind;


    switch (kind) {
      case 'Field':
        list[name.value] = true;
        return _extends({}, list, getFieldList(context, ast));
      case 'InlineFragment':
        return _extends({}, list, getFieldList(context, ast));
      case 'FragmentSpread':
        return _extends({}, list, getFieldList(context, context.fragments[name.value]));
      default:
        throw new Error('Unsuported query selection');
    }
  }, {});
}
'use strict';

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _query = require('./query');

(0, _keys2.default)(_query).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _query[key];
    }
  });
});
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_query).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
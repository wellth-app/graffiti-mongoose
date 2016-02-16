'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _query = require('./query');

var _loop = function _loop(_key2) {
  if (_key2 === "default") return 'continue';
  Object.defineProperty(exports, _key2, {
    enumerable: true,
    get: function get() {
      return _query[_key2];
    }
  });
};

for (var _key2 in _query) {
  var _ret = _loop(_key2);

  if (_ret === 'continue') continue;
}

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_query).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
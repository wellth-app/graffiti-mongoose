'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addHooks = exports.Middleware = undefined;

var _Middleware = require('./Middleware');

var _Middleware2 = _interopRequireDefault(_Middleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _promise2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _promise2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function addHooks(resolver) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      pre = _ref.pre,
      post = _ref.post;

  return function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var preMiddleware, postMiddleware, result;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              preMiddleware = new _Middleware2.default(pre);
              _context.next = 3;
              return preMiddleware.compose.apply(preMiddleware, _toConsumableArray(args));

            case 3:
              _context.t0 = _context.sent;

              if (_context.t0) {
                _context.next = 6;
                break;
              }

              _context.t0 = args;

            case 6:
              args = _context.t0;
              postMiddleware = new _Middleware2.default(post);
              _context.next = 10;
              return resolver.apply(undefined, _toConsumableArray(args));

            case 10:
              result = _context.sent;
              _context.next = 13;
              return postMiddleware.compose.apply(postMiddleware, [result].concat(_toConsumableArray(args)));

            case 13:
              _context.t1 = _context.sent;

              if (_context.t1) {
                _context.next = 16;
                break;
              }

              _context.t1 = result;

            case 16:
              return _context.abrupt('return', _context.t1);

            case 17:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function resolve() {
      return _ref2.apply(this, arguments);
    }

    return resolve;
  }();
}

exports.default = {
  Middleware: _Middleware2.default,
  addHooks: addHooks
};
exports.Middleware = _Middleware2.default;
exports.addHooks = addHooks;
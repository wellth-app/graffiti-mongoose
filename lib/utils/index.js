'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addHooks = exports.Middleware = undefined;

var _Middleware = require('./Middleware');

var _Middleware2 = _interopRequireDefault(_Middleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function addHooks(resolver) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var pre = _ref.pre;
  var post = _ref.post;

  return function () {
    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var preMiddleware, postMiddleware, result;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              preMiddleware = new _Middleware2.default(pre);
              _context.next = 3;
              return preMiddleware.compose.apply(preMiddleware, args);

            case 3:
              postMiddleware = new _Middleware2.default(post);
              _context.next = 6;
              return resolver.apply(undefined, args);

            case 6:
              result = _context.sent;
              _context.next = 9;
              return postMiddleware.compose.apply(postMiddleware, [result].concat(args));

            case 9:
              _context.t0 = _context.sent;

              if (_context.t0) {
                _context.next = 12;
                break;
              }

              _context.t0 = result;

            case 12:
              return _context.abrupt('return', _context.t0);

            case 13:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function resolve(_x2) {
      return ref.apply(this, arguments);
    };
  }();
}

exports.default = {
  Middleware: _Middleware2.default,
  addHooks: addHooks
};
exports.Middleware = _Middleware2.default;
exports.addHooks = addHooks;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Middleware = function () {
  function Middleware(middleware) {
    _classCallCheck(this, Middleware);

    this.middleware = [];

    this.use(middleware);
  }

  /**
   * Add middleware
   * @param  {Function} middleware
   */


  _createClass(Middleware, [{
    key: 'use',
    value: function use() {
      var middleware = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      if (!(0, _lodash.isArray)(middleware)) {
        middleware = [middleware];
      }
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = middleware[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var fn = _step.value;

          if (!(0, _lodash.isFunction)(fn)) {
            throw new TypeError('Middleware must be composed of functions!');
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.middleware = [].concat(_toConsumableArray(this.middleware), _toConsumableArray(middleware));
    }

    /**
     * Compose all middleware
     * @return {Function}
     */

  }, {
    key: 'compose',
    value: function compose() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var lastResult = undefined;
      return (0, _lodash.reduceRight)(this.middleware, function (mw, fn) {
        var next = function () {
          var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
            for (var _len2 = arguments.length, result = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              result[_key2] = arguments[_key2];
            }

            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    if (!result.length) {
                      result = args;
                    }
                    lastResult = result[0];
                    _context.next = 4;
                    return mw.call.apply(mw, [this].concat(_toConsumableArray(result)));

                  case 4:
                  case 'end':
                    return _context.stop();
                }
              }
            }, _callee, this);
          }));

          return function next(_x2) {
            return ref.apply(this, arguments);
          };
        }();
        return function () {
          var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
            for (var _len3 = arguments.length, result = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              result[_key3] = arguments[_key3];
            }

            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    if (!result.length) {
                      result = args;
                    }
                    _context2.next = 3;
                    return fn.call.apply(fn, [this, next].concat(_toConsumableArray(result)));

                  case 3:
                    return _context2.abrupt('return', lastResult);

                  case 4:
                  case 'end':
                    return _context2.stop();
                }
              }
            }, _callee2, this);
          }));

          return function composed(_x3) {
            return ref.apply(this, arguments);
          };
        }();
      }, function () {
        return null;
      })();
    }
  }]);

  return Middleware;
}();

exports.default = Middleware;
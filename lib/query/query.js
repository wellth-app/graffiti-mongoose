'use strict';

var _defineProperty2 = require('babel-runtime/core-js/object/define-property');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _iterator = require('babel-runtime/core-js/symbol/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connectionFromModel = exports.getListResolver = exports.getDeleteOneMutateHandler = exports.getUpdateOneMutateHandler = exports.getAddOneMutateHandler = exports.getOneResolver = exports.getIdFetcher = exports.idToCursor = exports._idToCursor = undefined;

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * Returns a connection based on a graffitiModel
 */
var connectionFromModel = function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(graffitiModel, args, context, info) {
    var Collection, before, after, first, last, id, _args$orderBy, orderBy, selector, begin, end, offset, limit, sort, newSort, result, count, edges, firstElement;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            Collection = graffitiModel.model;

            if (Collection) {
              _context.next = 3;
              break;
            }

            return _context.abrupt('return', emptyConnection());

          case 3:
            before = args.before, after = args.after, first = args.first, last = args.last, id = args.id, _args$orderBy = args.orderBy, orderBy = _args$orderBy === undefined ? { _id: 1 } : _args$orderBy, selector = _objectWithoutProperties(args, ['before', 'after', 'first', 'last', 'id', 'orderBy']);
            begin = getId(after);
            end = getId(before);
            offset = first - last || 0;
            limit = last || first;


            if (id) {
              selector.id = id;
            }

            if (begin) {
              selector._id = selector._id || {};
              selector._id.$gt = begin;
            }

            if (end) {
              selector._id = selector._id || {};
              selector._id.$lt = end;
            }

            sort = orderBy;


            if (last) {
              // must not modify orderBy object in place, as it may be a reusable enum
              newSort = {};

              (0, _lodash.forEach)(orderBy, function (val, key) {
                newSort[key] = val > 0 ? -1 : 1;
              });
              sort = newSort;
            }

            _context.next = 15;
            return getList(Collection, selector, {
              limit: limit,
              skip: offset,
              sort: sort
            }, context, info);

          case 15:
            result = _context.sent;
            _context.next = 18;
            return getCount(Collection, selector);

          case 18:
            count = _context.sent;

            if (!(result.length === 0)) {
              _context.next = 21;
              break;
            }

            return _context.abrupt('return', emptyConnection());

          case 21:
            edges = result.map(function (value) {
              return {
                cursor: idToCursor(value._id),
                node: value
              };
            });
            _context.next = 24;
            return getFirst(Collection);

          case 24:
            firstElement = _context.sent;
            return _context.abrupt('return', {
              count: count,
              edges: edges,
              pageInfo: {
                startCursor: edges[0].cursor,
                endCursor: edges[edges.length - 1].cursor,
                hasPreviousPage: cursorToId(edges[0].cursor) !== firstElement._id.toString(),
                hasNextPage: result.length === limit
              }
            });

          case 26:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function connectionFromModel(_x4, _x5, _x6, _x7) {
    return _ref10.apply(this, arguments);
  };
}();

var _lodash = require('lodash');

var _graphqlRelay = require('graphql-relay');

var _projection = require('./projection');

var _projection2 = _interopRequireDefault(_projection);

var _viewer = require('../model/viewer');

var _viewer2 = _interopRequireDefault(_viewer);

var _cache = require('./cache');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _promise2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _promise2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { (0, _defineProperty3.default)(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function processId(_ref) {
  var id = _ref.id,
      _ref$_id = _ref._id,
      _id = _ref$_id === undefined ? id : _ref$_id;

  // global or mongo id
  if ((0, _lodash.isString)(_id) && !/^[a-fA-F0-9]{24}$/.test(_id)) {
    var _fromGlobalId = (0, _graphqlRelay.fromGlobalId)(_id),
        type = _fromGlobalId.type,
        _id2 = _fromGlobalId.id;

    if (type && /^[a-zA-Z]*$/.test(type)) {
      return _id2;
    }
  }

  return _id;
}

function getCount(Collection, selector) {
  if (selector && ((0, _lodash.isArray)(selector.id) || (0, _lodash.isArray)(selector._id))) {
    var id = selector.id,
        _selector$_id = selector._id,
        _id = _selector$_id === undefined ? id : _selector$_id;

    delete selector.id;
    selector._id = {
      $in: _id.map(function (id) {
        return processId({ id: id });
      })
    };
  }

  return Collection.count(selector);
}

function getOne(Collection, args, context, info) {
  var id = processId(args);
  var projection = (0, _projection2.default)(info);
  var cachedItem = (0, _cache.getItemFromCacheById)(Collection, id, projection);
  if (cachedItem) {
    return new _promise2.default(function (resolve) {
      resolve(cachedItem);
    });
  }
  return Collection.findById(id, projection).then(function (result) {
    if (result) {
      var response = _extends({}, result.toObject(), {
        _type: Collection.modelName
      });
      (0, _cache.putItemIntoCacheById)(Collection, id, projection, response);
      return response;
    }

    return null;
  });
}

function addOne(Collection, args) {
  (0, _lodash.forEach)(args, function (arg, key) {
    if ((0, _lodash.isArray)(arg)) {
      args[key] = arg.map(function (id) {
        return processId({ id: id });
      });
    } else {
      args[key] = processId({ id: arg });
    }
  });

  var instance = new Collection(args);
  return instance.save().then(function (result) {
    if (result) {
      return _extends({}, result.toObject(), {
        _type: Collection.modelName
      });
    }

    return null;
  });
}

function updateOne(Collection, _ref2, context, info) {
  var id = _ref2.id,
      _id = _ref2._id,
      args = _objectWithoutProperties(_ref2, ['id', '_id']);

  _id = processId({ id: id, _id: _id });

  (0, _lodash.forEach)(args, function (arg, key) {
    if ((0, _lodash.isArray)(arg)) {
      args[key] = arg.map(function (id) {
        return processId({ id: id });
      });
    } else {
      args[key] = processId({ id: arg });
    }

    if (key.endsWith('_add')) {
      var values = args[key];
      args.$push = _defineProperty({}, key.slice(0, -'_add'.length), { $each: values });
      delete args[key];
    }
  });

  // clear the cache
  (0, _cache.invalidateCacheById)(Collection, _id);

  return Collection.update({ _id: _id }, args).then(function (res) {
    if (res.ok) {
      return getOne(Collection, { _id: _id }, context, info);
    }

    return null;
  });
}

function deleteOne(Collection, args) {
  var _id = processId(args);

  // clear the cache
  (0, _cache.invalidateCacheById)(Collection, _id);

  return Collection.remove({ _id: _id }).then(function (_ref3) {
    var result = _ref3.result;
    return {
      id: (0, _graphqlRelay.toGlobalId)(Collection.modelName, _id),
      ok: !!result.ok
    };
  });
}

function combineSelector(selector, field, key, value) {
  return selector[field] ? _extends({}, selector[field], _defineProperty({}, key, value)) : _defineProperty({}, key, value);
}

function getList(Collection, selector) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var context = arguments[3];
  var info = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

  if (selector && ((0, _lodash.isArray)(selector.id) || (0, _lodash.isArray)(selector._id))) {
    var id = selector.id,
        _selector$_id2 = selector._id,
        _id = _selector$_id2 === undefined ? id : _selector$_id2;

    delete selector.id;
    selector._id = {
      $in: _id.map(function (id) {
        return processId({ id: id });
      })
    };
  }

  if (selector) {
    var operatorRegex = /(.+)_(GTE|LTE|GT|LT|NE|ISNULL)$/;
    // preprocess to set up raw value selectors as { $eq: value } statements
    (0, _lodash.forEach)(selector, function (arg, key) {
      if (typeof key === 'string' && !operatorRegex.test(key) // doesn't match one of our operators
      && !(_typeof(selector[key]) === 'object' && selector[key] !== null && ('$in' in selector[key] || '$gt' in selector[key] || '$gte' in selector[key] || '$lt' in selector[key] || '$lte' in selector[key] || '$ne' in selector[key])) // isn't already a mongo clause
      ) {
          selector[key] = { $eq: selector[key] };
        }
    });
    (0, _lodash.forEach)(selector, function (arg, key) {
      if (typeof key === 'string') {
        var matches = key.match(operatorRegex);
        if (matches) {
          var field = matches[1];
          var operator = matches[2];
          delete selector[key];
          switch (operator) {
            case 'GT':
              selector[field] = combineSelector(selector, field, '$gt', arg);
              break;
            case 'LT':
              selector[field] = combineSelector(selector, field, '$lt', arg);
              break;
            case 'GTE':
              selector[field] = combineSelector(selector, field, '$gte', arg);
              break;
            case 'LTE':
              selector[field] = combineSelector(selector, field, '$lte', arg);
              break;
            case 'NE':
              selector[field] = combineSelector(selector, field, '$ne', arg);
              break;
            case 'ISNULL':
              if (arg) {
                selector[field] = combineSelector(selector, field, '$eq', null);
              } else {
                selector[field] = combineSelector(selector, field, '$exists', true);
                selector[field] = combineSelector(selector, field, '$ne', null);
              }
              break;
            default:
              throw new Error('Unsupported input argument operator "' + operator + '" in ' + key);
          }
        }
      }
    });
  }

  var projection = (0, _projection2.default)(info);
  return Collection.find(selector, projection, options).then(function (result) {
    return result.map(function (value) {
      return _extends({}, value.toObject(), {
        _type: Collection.modelName
      });
    });
  });
}

function getOneResolver(graffitiModel) {
  return function (root, args, context, info) {
    var Collection = graffitiModel.model;
    if (Collection) {
      return getOne(Collection, args, context, info);
    }

    return null;
  };
}

function getAddOneMutateHandler(graffitiModel) {
  // eslint-disable-next-line no-unused-vars
  return function (_ref5) {
    var clientMutationId = _ref5.clientMutationId,
        args = _objectWithoutProperties(_ref5, ['clientMutationId']);

    var Collection = graffitiModel.model;
    if (Collection) {
      return addOne(Collection, args);
    }

    return null;
  };
}

function setNulls(args) {
  if (args.deletions) {
    args.deletions.forEach(function (key) {
      var pathComponents = key.split('.');
      var parent = args;
      for (var i = 0; i < pathComponents.length; i += 1) {
        var pathComponent = pathComponents[i];
        if (i + 1 === pathComponents.length) {
          // this is the leaf node
          parent[pathComponent] = null;
        } else {
          // descend into tree, creating nodes if necessary
          if (!(pathComponent in parent)) {
            parent[pathComponent] = {};
          }
          parent = parent[pathComponent];
        }
      }
    });
    // so meta
    delete args.deletions;
  }
}

function getUpdateOneMutateHandler(graffitiModel) {
  // eslint-disable-next-line no-unused-vars
  return function (_ref6) {
    var clientMutationId = _ref6.clientMutationId,
        args = _objectWithoutProperties(_ref6, ['clientMutationId']);

    var Collection = graffitiModel.model;
    if (Collection) {
      setNulls(args);
      return updateOne(Collection, args);
    }

    return null;
  };
}

function getDeleteOneMutateHandler(graffitiModel) {
  // eslint-disable-next-line no-unused-vars
  return function (_ref7) {
    var clientMutationId = _ref7.clientMutationId,
        args = _objectWithoutProperties(_ref7, ['clientMutationId']);

    var Collection = graffitiModel.model;
    if (Collection) {
      return deleteOne(Collection, args);
    }

    return null;
  };
}

function getListResolver(graffitiModel) {
  return function (root) {
    var _ref8 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var ids = _ref8.ids,
        args = _objectWithoutProperties(_ref8, ['ids']);

    var context = arguments[2];
    var info = arguments[3];

    if (ids) {
      args.id = ids;
    }

    var sort = args.orderBy;

    delete args.orderBy;

    var Collection = graffitiModel.model;
    if (Collection) {
      return getList(Collection, args, { sort: sort }, context, info);
    }

    return null;
  };
}

/**
 * Returns the first element in a Collection
 */
function getFirst(Collection) {
  return Collection.findOne({}, {}, { sort: { _id: 1 } });
}

/**
 * Returns an idFetcher function, that can resolve
 * an object based on a global id
 */
function getIdFetcher(graffitiModels) {
  return function idFetcher(obj, _ref9, context, info) {
    var globalId = _ref9.id;

    var _fromGlobalId2 = (0, _graphqlRelay.fromGlobalId)(globalId),
        type = _fromGlobalId2.type,
        id = _fromGlobalId2.id;

    if (type === 'Viewer') {
      return _viewer2.default;
    } else if (graffitiModels[type]) {
      var Collection = graffitiModels[type].model;
      return getOne(Collection, { id: id }, context, info);
    }

    return null;
  };
}

/**
 * Helper to get an empty connection.
 */
function emptyConnection() {
  return {
    count: 0,
    edges: [],
    pageInfo: {
      startCursor: null,
      endCursor: null,
      hasPreviousPage: false,
      hasNextPage: false
    }
  };
}

var PREFIX = 'connection.';

function base64(i) {
  return new Buffer(i, 'ascii').toString('base64');
}

function unbase64(i) {
  return new Buffer(i, 'base64').toString('ascii');
}

/**
 * Creates the cursor string from an offset.
 */
function idToCursor(id) {
  return base64(PREFIX + id);
}

/**
 * Rederives the offset from the cursor string.
 */
function cursorToId(cursor) {
  return unbase64(cursor).substring(PREFIX.length);
}

/**
 * Given an optional cursor and a default offset, returns the offset
 * to use; if the cursor contains a valid offset, that will be used,
 * otherwise it will be the default.
 */
function getId(cursor) {
  if (cursor === undefined || cursor === null) {
    return null;
  }

  return cursorToId(cursor);
}exports.default = {
  getOneResolver: getOneResolver,
  getListResolver: getListResolver,
  getAddOneMutateHandler: getAddOneMutateHandler,
  getUpdateOneMutateHandler: getUpdateOneMutateHandler,
  getDeleteOneMutateHandler: getDeleteOneMutateHandler
};
exports._idToCursor = idToCursor;
exports.idToCursor = idToCursor;
exports.getIdFetcher = getIdFetcher;
exports.getOneResolver = getOneResolver;
exports.getAddOneMutateHandler = getAddOneMutateHandler;
exports.getUpdateOneMutateHandler = getUpdateOneMutateHandler;
exports.getDeleteOneMutateHandler = getDeleteOneMutateHandler;
exports.getListResolver = getListResolver;
exports.connectionFromModel = connectionFromModel;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connectionFromModel = exports.getListResolver = exports.getDeleteOneMutateHandler = exports.getUpdateOneMutateHandler = exports.getAddOneMutateHandler = exports.getOneResolver = exports.getIdFetcher = exports.idToCursor = exports._idToCursor = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * Returns a connection based on a graffitiModel
 */

var connectionFromModel = function () {
  var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(graffitiModel, args, info) {
    var Collection, before, after, first, last, id, _args$orderBy, orderBy, selector, begin, end, offset, limit, sort, result, count, edges, firstElement;

    return regeneratorRuntime.wrap(function _callee$(_context) {
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
            before = args.before;
            after = args.after;
            first = args.first;
            last = args.last;
            id = args.id;
            _args$orderBy = args.orderBy;
            orderBy = _args$orderBy === undefined ? { _id: 1 } : _args$orderBy;
            selector = _objectWithoutProperties(args, ['before', 'after', 'first', 'last', 'id', 'orderBy']);
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
              (function () {
                // must not modify orderBy object in place, as it may be a reusable enum
                var newSort = {};
                (0, _lodash.forEach)(orderBy, function (val, key) {
                  newSort[key] = val > 0 ? -1 : 1;
                });
                sort = newSort;
              })();
            }

            _context.next = 22;
            return getList(Collection, selector, {
              limit: limit,
              skip: offset,
              sort: sort
            }, info);

          case 22:
            result = _context.sent;
            _context.next = 25;
            return getCount(Collection, selector);

          case 25:
            count = _context.sent;

            if (!(result.length === 0)) {
              _context.next = 28;
              break;
            }

            return _context.abrupt('return', emptyConnection());

          case 28:
            edges = result.map(function (value) {
              return {
                cursor: idToCursor(value._id),
                node: value
              };
            });
            _context.next = 31;
            return getFirst(Collection);

          case 31:
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

          case 33:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function connectionFromModel(_x4, _x5, _x6) {
    return ref.apply(this, arguments);
  };
}();

var _lodash = require('lodash');

var _graphqlRelay = require('graphql-relay');

var _projection = require('./projection');

var _projection2 = _interopRequireDefault(_projection);

var _viewer = require('../model/viewer');

var _viewer2 = _interopRequireDefault(_viewer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function processId(_ref) {
  var id = _ref.id;
  var _ref$_id = _ref._id;

  var _id = _ref$_id === undefined ? id : _ref$_id;

  // global or mongo id
  if ((0, _lodash.isString)(_id) && !/^[a-fA-F0-9]{24}$/.test(_id)) {
    var _fromGlobalId = (0, _graphqlRelay.fromGlobalId)(_id);

    var type = _fromGlobalId.type;
    var _id2 = _fromGlobalId.id;

    if (type && /^[a-zA-Z]*$/.test(type)) {
      return _id2;
    }
  }

  return _id;
}

function getCount(Collection, selector) {
  if (selector && ((0, _lodash.isArray)(selector.id) || (0, _lodash.isArray)(selector._id))) {
    var id = selector.id;
    var _selector$_id = selector._id;

    var _id = _selector$_id === undefined ? id : _selector$_id;

    delete selector.id;
    selector._id = {
      $in: _id.map(function (id) {
        return processId({ id: id });
      })
    };
  }

  return Collection.count(selector);
}

function getOne(Collection, args, info) {
  var id = processId(args);
  var projection = (0, _projection2.default)(info);
  return Collection.findById(id, projection).then(function (result) {
    if (result) {
      return _extends({}, result.toObject(), {
        _type: Collection.modelName
      });
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

function updateOne(Collection, _ref2, info) {
  var id = _ref2.id;
  var _id = _ref2._id;

  var args = _objectWithoutProperties(_ref2, ['id', '_id']);

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
      args.$push = _defineProperty({}, key.slice(0, -4), { $each: values });
      delete args[key];
    }
  });

  return Collection.update({ _id: _id }, args).then(function (res) {
    if (res.ok) {
      return getOne(Collection, { _id: _id }, info);
    }

    return null;
  });
}

function deleteOne(Collection, args) {
  var _id = processId(args);

  return Collection.remove({ _id: _id }).then(function (_ref3) {
    var result = _ref3.result;
    return {
      id: (0, _graphqlRelay.toGlobalId)(Collection.modelName, _id),
      ok: !!result.ok
    };
  });
}

function getList(Collection, selector) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var info = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

  if (selector && ((0, _lodash.isArray)(selector.id) || (0, _lodash.isArray)(selector._id))) {
    var id = selector.id;
    var _selector$_id2 = selector._id;

    var _id = _selector$_id2 === undefined ? id : _selector$_id2;

    delete selector.id;
    selector._id = {
      $in: _id.map(function (id) {
        return processId({ id: id });
      })
    };
  }

  if (selector) {
    (0, _lodash.forEach)(selector, function (arg, key) {
      if (typeof key === 'string') {
        var matches = key.match(/(.+)_(GTE|LTE|GT|LT|NE)$/);
        if (matches) {
          var field = matches[1];
          var operator = matches[2];
          delete selector[key];
          switch (operator) {
            case 'GT':
              selector[field] = { $gt: arg };
              break;
            case 'LT':
              selector[field] = { $lt: arg };
              break;
            case 'GTE':
              selector[field] = { $gte: arg };
              break;
            case 'LTE':
              selector[field] = { $lte: arg };
              break;
            case 'NE':
              selector[field] = { $ne: arg };
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
  return function (root, args, info) {
    var Collection = graffitiModel.model;
    if (Collection) {
      return getOne(Collection, args, info);
    }

    return null;
  };
}

function getAddOneMutateHandler(graffitiModel) {
  return function (_ref4) {
    var clientMutationId = _ref4.clientMutationId;

    var args = _objectWithoutProperties(_ref4, ['clientMutationId']);

    // eslint-disable-line
    var Collection = graffitiModel.model;
    if (Collection) {
      return addOne(Collection, args);
    }

    return null;
  };
}

function getUpdateOneMutateHandler(graffitiModel) {
  return function (_ref5) {
    var clientMutationId = _ref5.clientMutationId;

    var args = _objectWithoutProperties(_ref5, ['clientMutationId']);

    // eslint-disable-line
    var Collection = graffitiModel.model;
    if (Collection) {
      return updateOne(Collection, args);
    }

    return null;
  };
}

function getDeleteOneMutateHandler(graffitiModel) {
  return function (_ref6) {
    var clientMutationId = _ref6.clientMutationId;

    var args = _objectWithoutProperties(_ref6, ['clientMutationId']);

    // eslint-disable-line
    var Collection = graffitiModel.model;
    if (Collection) {
      return deleteOne(Collection, args);
    }

    return null;
  };
}

function getListResolver(graffitiModel) {
  return function (root) {
    var _ref7 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var ids = _ref7.ids;

    var args = _objectWithoutProperties(_ref7, ['ids']);

    var info = arguments[2];

    if (ids) {
      args.id = ids;
    }

    var sort = args.orderBy;

    delete args.orderBy;

    var Collection = graffitiModel.model;
    if (Collection) {
      return getList(Collection, args, { sort: sort }, info);
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
  return function idFetcher(obj, _ref8, info) {
    var globalId = _ref8.id;

    var _fromGlobalId2 = (0, _graphqlRelay.fromGlobalId)(globalId);

    var type = _fromGlobalId2.type;
    var id = _fromGlobalId2.id;


    if (type === 'Viewer') {
      return _viewer2.default;
    } else if (graffitiModels[type]) {
      var Collection = graffitiModels[type].model;
      return getOne(Collection, { id: id }, info);
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
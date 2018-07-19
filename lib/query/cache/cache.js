'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCacheByCollection = getCacheByCollection;
exports.getItemFromCacheById = getItemFromCacheById;
exports.putItemIntoCacheById = putItemIntoCacheById;
exports.invalidateCacheById = invalidateCacheById;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var typeToCacheMap = {};

var options = {
  max: 20, // maximum number of items the cache can hold before purging oldest items
  maxAge: 1000 * 2 // maximum number of milliseconds that the cache can hold an item before purging it
};

function getCacheByCollection(Collection) {
  var typeKey = Collection.modelName;
  var typeCache = typeToCacheMap[typeKey];
  if (!typeCache) {
    typeToCacheMap[typeKey] = (0, _lruCache2.default)(options);
    typeCache = typeToCacheMap[typeKey];
  }
  return typeCache;
}

function getItemFromCacheById(Collection, id, projection) {
  var typeCache = getCacheByCollection(Collection);
  // we use peek here, since we only want the set operation to update the "recently-usedness" of the item
  // because we want to expire items that haven't been fetched from the database recently
  var itemContainer = typeCache.peek(id);
  if (!itemContainer) {
    return undefined;
  }
  var storedItem = itemContainer.item;
  var storedProjection = itemContainer.projection;
  // ensure the requested projection is the same as the stored one
  return _lodash2.default.isEqual(storedProjection, projection) ? storedItem : undefined;
}

function putItemIntoCacheById(Collection, id, projection, item) {
  var itemContainer = {
    item: item,
    projection: projection
  };
  var typeCache = getCacheByCollection(Collection);
  typeCache.set(id, itemContainer);
}

function invalidateCacheById(Collection, id) {
  var typeCache = getCacheByCollection(Collection);
  typeCache.del(id);
}

exports.default = {
  getCacheByCollection: getCacheByCollection,
  getItemFromCacheById: getItemFromCacheById,
  putItemIntoCacheById: putItemIntoCacheById,
  invalidateCacheById: invalidateCacheById
};

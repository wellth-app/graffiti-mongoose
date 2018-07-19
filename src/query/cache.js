import _ from 'lodash';
import LRU from 'lru-cache';

const typeToCacheMap = {};

const options = {
  max: 20,          // maximum number of items the cache can hold before purging oldest items
  maxAge: 1000 * 2  // maximum number of milliseconds that the cache can hold an item before purging it
};

export function getCacheByCollection(Collection) {
  const typeKey = Collection.modelName;
  let typeCache = typeToCacheMap[typeKey];
  if (!typeCache) {
    typeToCacheMap[typeKey] = LRU(options);
    typeCache = typeToCacheMap[typeKey];
  }
  return typeCache;
}

export function getItemFromCacheById(Collection, id, projection) {
  const typeCache = getCacheByCollection(Collection);
  // we use peek here, since we only want the set operation to update the "recently-usedness" of the item
  // because we want to expire items that haven't been fetched from the database recently
  const itemContainer = typeCache.peek(id);
  if (!itemContainer) {
    return undefined;
  }
  const storedItem = itemContainer.item;
  const storedProjection = itemContainer.projection;
  // ensure the requested projection is the same as the stored one
  return _.isEqual(storedProjection, projection) ?
    storedItem : undefined;
}

export function putItemIntoCacheById(Collection, id, projection, item) {
  const itemContainer = {
    item,
    projection
  };
  const typeCache = getCacheByCollection(Collection);
  typeCache.set(id, itemContainer);
}

export function invalidateCacheById(Collection, id) {
  const typeCache = getCacheByCollection(Collection);
  typeCache.del(id);
}

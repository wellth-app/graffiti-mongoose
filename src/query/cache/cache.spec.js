import { expect } from 'chai';
import objectid from 'objectid';
import LRU from 'lru-cache';
import {
  getCacheByCollection,
  getItemFromCacheById,
  putItemIntoCacheById,
  invalidateCacheById
} from './cache';

describe('cache', () => {
  class MongooseObject {
    constructor(fields) {
      Object.assign(this, fields);
    }

    toObject() {
      return this;
    }
  }

  const fields = { name: 'foo' };
  const type = 'type';
  const objArray = [];
  const resultArray = [];
  for (let i = 0; i < 10; i += 1) {
    const objFields = {
      ...fields,
      _id: objectid().toString()
    };
    objArray.push(new MongooseObject(objFields));
    resultArray.push({
      ...objFields,
      _type: type
    });
  }

  const graffitiModels = {
    type: {
      model: {
        modelName: type,
        findById(id) {
          const obj = objArray.find((obj) => obj._id === id);
          return Promise.resolve(obj);
        },

        findOne() {
          return Promise.resolve(objArray[0]);
        },

        find() {
          return Promise.resolve(objArray);
        },

        count() {
          return Promise.resolve(objArray.length);
        }
      }
    }
  };

  const collection = graffitiModels.type.model;

  describe('getCacheByCollection', () => {
    it('should get a cache for a collection', () => {
      expect(getCacheByCollection(collection)).instanceOf(LRU);
    });

    it('should get a cache for the same collection again', async () => {
      expect(getCacheByCollection(collection)).instanceOf(LRU);
    });
  });

  describe('putItemIntoCachebyId', () => {
    it('should put an object', () => {
      putItemIntoCacheById(collection, '123', 'a b c', { a: 1, b: 2, c: 3 });
    });
  });

  describe('invalidateCacheById', () => {
    it('should work on an existing object', () => {
      putItemIntoCacheById(collection, '123', 'a b c', { a: 1, b: 2, c: 3 });
      invalidateCacheById(collection, '123');
    });

    it('should still work on a non-existing object', () => {
      invalidateCacheById(collection, '555');
    });
  });

  describe('getItemFromCacheById', () => {
    it('should put and fetch an object', () => {
      const item = { a: 1, b: 2, c: 3 };
      putItemIntoCacheById(collection, '123', 'a b c', item);
      const result = getItemFromCacheById(collection, '123', 'a b c');
      expect(result).to.eql(item);
    });

    it('should return undefined for a new projection', async () => {
      const item = { a: 1, b: 2, c: 3 };
      putItemIntoCacheById(collection, '123', 'a b c', item);
      const result = getItemFromCacheById(collection, '123', 'a b c d');
      expect(result).to.be.undefined; // eslint-disable-line no-unused-expressions
    });

    it('should return undefined for a new id', async () => {
      const item = { a: 1, b: 2, c: 3 };
      putItemIntoCacheById(collection, '123', 'a b c', item);
      const result = getItemFromCacheById(collection, '1234', 'a b c d');
      expect(result).to.be.undefined; // eslint-disable-line no-unused-expressions
    });
  });
});

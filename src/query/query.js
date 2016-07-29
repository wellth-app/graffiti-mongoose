import {forEach, isArray, isString} from 'lodash';
import {fromGlobalId, toGlobalId} from 'graphql-relay';
import getFieldList from './projection';
import viewer from '../model/viewer';

function processId({id, _id = id}) {
  // global or mongo id
  if (isString(_id) && !/^[a-fA-F0-9]{24}$/.test(_id)) {
    const {type, id} = fromGlobalId(_id);
    if (type && /^[a-zA-Z]*$/.test(type)) {
      return id;
    }
  }

  return _id;
}

function getCount(Collection, selector) {
  if (selector && (isArray(selector.id) || isArray(selector._id))) {
    const {id, _id = id} = selector;
    delete selector.id;
    selector._id = {
      $in: _id.map((id) => processId({id}))
    };
  }

  return Collection.count(selector);
}

function getOne(Collection, args, info) {
  const id = processId(args);
  const projection = getFieldList(info);
  return Collection.findById(id, projection).then((result) => {
    if (result) {
      return {
        ...result.toObject(),
        _type: Collection.modelName
      };
    }

    return null;
  });
}

function addOne(Collection, args) {
  forEach(args, (arg, key) => {
    if (isArray(arg)) {
      args[key] = arg.map((id) => processId({id}));
    } else {
      args[key] = processId({id: arg});
    }
  });

  const instance = new Collection(args);
  return instance.save().then((result) => {
    if (result) {
      return {
        ...result.toObject(),
        _type: Collection.modelName
      };
    }

    return null;
  });
}

function updateOne(Collection, {id, _id, ...args}, info) {
  _id = processId({id, _id});


  forEach(args, (arg, key) => {
    if (isArray(arg)) {
      args[key] = arg.map((id) => processId({id}));
    } else {
      args[key] = processId({id: arg});
    }

    if (key.endsWith('_add')) {
      const values = args[key];
      args.$push = {
        [key.slice(0, -4)]: {$each: values}
      };
      delete args[key];
    }
  });

  return Collection.update({_id}, args).then((res) => {
    if (res.ok) {
      return getOne(Collection, {_id}, info);
    }

    return null;
  });
}

function deleteOne(Collection, args) {
  const _id = processId(args);

  return Collection.remove({_id}).then(({result}) => ({
    id: toGlobalId(Collection.modelName, _id),
    ok: !!result.ok
  }));
}

function getList(Collection, selector, options = {}, info = null) {
  if (selector && (isArray(selector.id) || isArray(selector._id))) {
    const {id, _id = id} = selector;
    delete selector.id;
    selector._id = {
      $in: _id.map((id) => processId({id}))
    };
  }

  if (selector) {
    forEach(selector, (arg, key) => {
      if (typeof key === 'string') {
        const matches = key.match(/(.+)_(GTE|LTE|GT|LT|NE)$/);
        if (matches) {
          const field = matches[1];
          const operator = matches[2];
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
          default: throw new Error(`Unsupported input argument operator "${operator}" in ${key}`);
          }
        }
      }
    });
  }

  const projection = getFieldList(info);
  return Collection.find(selector, projection, options).then((result) => (
    result.map((value) => ({
      ...value.toObject(),
      _type: Collection.modelName
    }))
  ));
}

function getOneResolver(graffitiModel) {
  return (root, args, info) => {
    const Collection = graffitiModel.model;
    if (Collection) {
      return getOne(Collection, args, info);
    }

    return null;
  };
}

function getAddOneMutateHandler(graffitiModel) {
  return ({clientMutationId, ...args}) => { // eslint-disable-line
    const Collection = graffitiModel.model;
    if (Collection) {
      return addOne(Collection, args);
    }

    return null;
  };
}

function setNulls(args) {
  if (args.deletions) {
    for (const key of args.deletions) {
      const pathComponents = key.split('.');
      let parent = args;
      for (let i = 0; i < pathComponents.length; i++) {
        const pathComponent = pathComponents[i];
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
    }
    // so meta
    delete args.deletions;
  }
}

function getUpdateOneMutateHandler(graffitiModel) {
  return ({clientMutationId, ...args}) => { // eslint-disable-line
    const Collection = graffitiModel.model;
    if (Collection) {
      setNulls(args);
      return updateOne(Collection, args);
    }

    return null;
  };
}

function getDeleteOneMutateHandler(graffitiModel) {
  return ({clientMutationId, ...args}) => { // eslint-disable-line
    const Collection = graffitiModel.model;
    if (Collection) {
      return deleteOne(Collection, args);
    }

    return null;
  };
}

function getListResolver(graffitiModel) {
  return (root, {ids, ...args} = {}, info) => {
    if (ids) {
      args.id = ids;
    }

    const { orderBy: sort } = args;
    delete args.orderBy;

    const Collection = graffitiModel.model;
    if (Collection) {
      return getList(Collection, args, {sort}, info);
    }

    return null;
  };
}

/**
 * Returns the first element in a Collection
 */
function getFirst(Collection) {
  return Collection.findOne({}, {}, {sort: {_id: 1}});
}

/**
 * Returns an idFetcher function, that can resolve
 * an object based on a global id
 */
function getIdFetcher(graffitiModels) {
  return function idFetcher(obj, {id: globalId}, info) {
    const {type, id} = fromGlobalId(globalId);

    if (type === 'Viewer') {
      return viewer;
    } else if (graffitiModels[type]) {
      const Collection = graffitiModels[type].model;
      return getOne(Collection, {id}, info);
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

const PREFIX = 'connection.';

function base64(i) {
  return ((new Buffer(i, 'ascii')).toString('base64'));
}

function unbase64(i) {
  return ((new Buffer(i, 'base64')).toString('ascii'));
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
}

/**
 * Returns a connection based on a graffitiModel
 */
async function connectionFromModel(graffitiModel, args, info) {
  const Collection = graffitiModel.model;
  if (!Collection) {
    return emptyConnection();
  }

  const {before, after, first, last, id, orderBy = {_id: 1}, ...selector} = args;

  const begin = getId(after);
  const end = getId(before);

  const offset = (first - last) || 0;
  const limit = last || first;

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

  let sort = orderBy;

  if (last) {
    // must not modify orderBy object in place, as it may be a reusable enum
    const newSort = {};
    forEach(orderBy, (val, key) => {
      newSort[key] = val > 0 ? -1 : 1;
    });
    sort = newSort;
  }

  const result = await getList(Collection, selector, {
    limit,
    skip: offset,
    sort
  }, info);
  const count = await getCount(Collection, selector);

  if (result.length === 0) {
    return emptyConnection();
  }

  const edges = result.map((value) => ({
    cursor: idToCursor(value._id),
    node: value
  }));

  const firstElement = await getFirst(Collection);
  return {
    count,
    edges,
    pageInfo: {
      startCursor: edges[0].cursor,
      endCursor: edges[edges.length - 1].cursor,
      hasPreviousPage: cursorToId(edges[0].cursor) !== firstElement._id.toString(),
      hasNextPage: result.length === limit
    }
  };
}

export default {
  getOneResolver,
  getListResolver,
  getAddOneMutateHandler,
  getUpdateOneMutateHandler,
  getDeleteOneMutateHandler
};

export {
  idToCursor as _idToCursor,
  idToCursor,
  getIdFetcher,
  getOneResolver,
  getAddOneMutateHandler,
  getUpdateOneMutateHandler,
  getDeleteOneMutateHandler,
  getListResolver,
  connectionFromModel
};

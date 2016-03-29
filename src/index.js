import {graphql} from 'graphql';
import {
  getTypes,
  GraphQLBuffer,
  GraphQLDate,
  GraphQLGeneric,
  GraphQLViewer
} from './type';
import {getSchema} from './schema';
import {getModels} from './model';

function _getTypes(mongooseModels) {
  const graffitiModels = getModels(mongooseModels);
  return getTypes(graffitiModels);
}

export default {
  graphql,
  getSchema,
  getTypes: _getTypes,
  GraphQLBuffer,
  GraphQLDate,
  GraphQLGeneric,
  GraphQLViewer
};

export {
  graphql,
  getSchema,
  _getTypes as getTypes,
  GraphQLBuffer,
  GraphQLDate,
  GraphQLGeneric,
  GraphQLViewer
};

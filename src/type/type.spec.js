import { expect } from 'chai';
import { forEach } from 'lodash';
import {
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull
} from 'graphql/type';

import {
  GraphQLDate,
  GraphQLGeneric,
  getType,
  getTypes,
  getArguments
} from './';

describe('type', () => {
  let user;
  before(() => {
    user = {
      name: 'User',
      fields: {
        name: {
          type: 'String'
        },
        age: {
          type: 'Number'
        },
        mother: {
          type: 'ObjectID',
          reference: 'User',
          description: 'The user\'s mother'
        },
        friends: {
          type: 'Array',
          subtype: 'ObjectID',
          reference: 'User'
        },
        enumerations: {
          type: 'Array',
          subtype: 'String',
          enumValues: ['a', 'b', 'c']
        },
        weight: {
          type: 'Number'
        },
        createdAt: {
          type: 'Date'
        },
        removed: {
          type: 'Boolean'
        },
        nums: {
          type: 'Array',
          subtype: 'Number'
        },
        unknownType: {
          type: 'Unknown'
        },
        hidden: {
          type: 'String',
          hidden: true
        },
        sub: {
          type: 'Object',
          fields: {
            foo: {
              type: 'String'
            },
            nums: {
              type: 'Array',
              subtype: 'Number'
            },
            subsub: {
              type: 'Object',
              fields: {
                bar: {
                  type: 'Number'
                },
                sister: {
                  type: 'ObjectID',
                  reference: 'User',
                  description: 'The user\'s sister'
                }
              }
            }
          }
        },
        subArray: {
          type: 'Array',
          subtype: 'Object',
          fields: {
            foo: {
              type: 'String'
            },
            nums: {
              type: 'Array',
              subtype: 'Number'
            },
            brother: {
              type: 'ObjectID',
              reference: 'User',
              description: 'The user\'s brother'
            }
          }
        }
      }
    };
  });

  describe('getType', () => {
    it('should implement the Node interface', () => {
      const result = getType([], user);
      expect(result._typeConfig.interfaces).to.containSubset([{
        name: 'Node'
      }]);
      expect(result._typeConfig.fields()).to.containSubset({
        id: {
          type: new GraphQLNonNull(GraphQLID)
        }
      });
    });

    it('should specify the fields', () => {
      const result = getType([], user);
      const fields = result._typeConfig.fields();
      expect(fields.enumerations).to.containSubset({
        name: 'enumerations',
        type: {
          ofType: {
            _enumConfig: {
              name: 'UserEnumerationsEnum',
              values: {
                a: { //eslint-disable-line
                  value: 'a'
                },
                b: { //eslint-disable-line
                  value: 'b'
                },
                c: { //eslint-disable-line
                  value: 'c'
                }
              }
            }
          }
        }
      });
      expect(fields).to.containSubset({
        name: {
          name: 'name',
          type: GraphQLString
        },
        age: {
          name: 'age',
          type: GraphQLFloat
        },
        mother: {
          name: 'mother',
          type: GraphQLID,
          description: 'The user\'s mother'
        },
        friends: {
          name: 'friends',
          type: new GraphQLList(GraphQLID)
        },
        weight: {
          name: 'weight',
          type: GraphQLFloat
        },
        createdAt: {
          name: 'createdAt',
          type: GraphQLDate
        },
        removed: {
          name: 'removed',
          type: GraphQLBoolean
        },
        nums: {
          name: 'nums',
          type: new GraphQLList(GraphQLFloat)
        },
        unknownType: {
          name: 'unknownType',
          type: GraphQLGeneric
        },
        sub: {
          name: 'sub'
        }
      });

      // sub
      const subFields = fields.sub.type._typeConfig.fields();
      expect(subFields).to.containSubset({
        foo: {
          name: 'foo',
          type: GraphQLString
        },
        nums: {
          name: 'nums',
          type: new GraphQLList(GraphQLFloat)
        },
        subsub: {
          name: 'subsub'
        }
      });

      // subsub
      const subsubFields = subFields.subsub.type._typeConfig.fields();
      expect(subsubFields).to.containSubset({
        bar: {
          name: 'bar',
          type: GraphQLFloat
        },
        sister: {
          name: 'sister',
          type: GraphQLID,
          description: 'The user\'s sister'
        }
      });

      const subArrayFields = fields.subArray.type.ofType._typeConfig.fields();
      expect(subArrayFields).to.containSubset({
        foo: {
          name: 'foo',
          type: GraphQLString
        },
        nums: {
          name: 'nums',
          type: new GraphQLList(GraphQLFloat)
        },
        brother: {
          name: 'brother',
          type: GraphQLID,
          description: 'The user\'s brother'
        }
      });
    });

    it('should not include hidden fields', () => {
      const result = getType([], user);
      const fields = result._typeConfig.fields();
      expect(fields.hidden).to.be.eql(undefined);
    });
  });

  describe('getArguments', () => {
    it('should include operator variants in arguments', () => {
      const type = getType([], user);
      const result = getArguments(type);
      forEach(['weight', 'createdAt', 'removed', 'nums'], (fieldName) => {
        forEach(['GT', 'GTE', 'LT', 'LTE', 'NE', 'ISNULL'], (operator) => {
          const variant = `${fieldName}_${operator}`;
          expect(result[variant]).to.be.ok; // eslint-disable-line
        });
      });
    });
  });

  describe('getTypes', () => {
    it('should fail to resolve the sister reference if using e2e tests\' cached types', () => {
      const result = getTypes([user], false);
      const userType = result[user.name];
      const fields = userType._typeConfig.fields();

      expect(fields.mother.type).to.be.equal(userType);
      expect(fields.sub.type._fields.subsub.type._fields.sister).to.be.not.ok; //eslint-disable-line
      expect(fields.subArray.type.ofType._typeConfig.fields().brother.type).to.be.equal(userType);

      // connection type
      const nodeField = fields.friends.type._typeConfig.fields().edges.type.ofType._typeConfig.fields().node;
      expect(nodeField.type).to.be.equal(userType);
    });

    it('should resolve the references', () => {
      const result = getTypes([user]);
      const userType = result[user.name];
      const fields = userType._typeConfig.fields();

      expect(fields.mother.type).to.be.equal(userType);
      expect(fields.sub.type._typeConfig.fields().subsub.type._typeConfig.fields().sister.type).to.be.equal(userType);
      expect(fields.subArray.type.ofType._typeConfig.fields().brother.type).to.be.equal(userType);

      // connection type
      const nodeField = fields.friends.type._typeConfig.fields().edges.type.ofType._typeConfig.fields().node;
      expect(nodeField.type).to.be.equal(userType);
    });
  });
});

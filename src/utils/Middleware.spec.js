import {expect} from 'chai';
import {Middleware} from './';

describe('Middleware', () => {
  it('should work properly', (done) => {
    const middleware = new Middleware();

    const fn1 = (next, {data}, {data2}) => {
      expect(data).to.be.eql(1);
      expect(data2).to.be.eql(2);
      next({data: 2});
    };
    middleware.use(fn1);

    middleware.compose({data: 1}).then((result) => {
      expect(result).to.be.eql({data: 2});
      done();
    });

    const fn2 = (next, {data}) => {
      expect(data).to.be.eql(2);
      next({data: 3}, {data2: 5});
    };
    middleware.use(fn2);

    middleware.compose({data: 1}, {data2: 2}).then((result) => {
      expect(result).to.be.eql([{data: 3}, {data2: 5}]);
      done();
    });
  });
});

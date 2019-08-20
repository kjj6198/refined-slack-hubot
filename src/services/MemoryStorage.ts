import Cache from 'node-cache';

const cacheStore = new Cache({
  stdTTL: 100,
  checkperiod: 120,
});

export default cacheStore;

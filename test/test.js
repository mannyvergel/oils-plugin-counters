'use strict';

const path = require('path');

const oilsPath = path.join(process.cwd(), '../oils-js');
const Web = require(oilsPath);

const assert = require("assert");

const conf = {
  baseDir: oilsPath,
  secretPassphrase: "fk12r9012kr9faks9!!",
  plugins: {
  'oils-plugin-counters': {
      enabled: true,
      pluginPath: '/../oils-plugin-counters',
      counterModelPath: '/../oils-plugin-counters/lib/models/Counter.js'
    }
  }
}

const web = new Web(conf);

describe('app', function() {
  this.timeout(40000);

  web.start();

  before(async function() {
    await sleep(2000);

    await web.counters.remove('testManualCounterModel',
      'testIncrementModel',
      'testSetModel',
      'testIncrementAndExpireModel'
      );
  })

  it('should have execute correctly', async function() {
    const Counter = web.models('Counter');

    const testManualCounterModel = new Counter({id: 'testManualCounterModel'});
    await testManualCounterModel.save();

    await web.counters.increment('testIncrementModel');
    await web.counters.increment('testIncrementModel');

    await web.counters.increment('testIncrementModel');

    await web.counters.decrement('testIncrementModel');

    web.counters.set('testSetModel', 3);

    // cannot test properly atm, but it should work
    // web.counters.incrementAndExpire('testIncrementAndExpireModel', 1);

  });

  it('should read values correctly', async function() {
    // const Counter = web.models('Counter');

    assert.strictEqual(1, await web.counters.get('testManualCounterModel'));
    assert.strictEqual(2, await web.counters.get('testIncrementModel'));
    assert.strictEqual(3, await web.counters.get('testSetModel'));
    // assert.strictEqual(1, await web.counters.get('testIncrementAndExpireModel'));

  });

  // it('should expire', async function() {

  //   // note that expires is not exactly timed due to cron nature
  //   console.log("Waiting to test increment and expire..");
  //   await sleep(120000);
  //   console.log('!!!', web.counters.get('testIncrementAndExpireModel'));
  //   assert.strictEqual(0, await web.counters.get('testIncrementAndExpireModel'));
  // })


  it('should reset properly', async function() {
    await web.counters.resetAll();

    assert.strictEqual(0, await web.counters.get('testManualCounterModel'));
    assert.strictEqual(0, await web.counters.get('testIncrementModel'));
    assert.strictEqual(0, await web.counters.get('testSetModel'));
  });

  after(async function() {
    await web.counters.removeAll();
    process.exit();
  })
});

function sleep(ms) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, ms);
  });
}
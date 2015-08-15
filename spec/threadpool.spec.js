require('./helpers');
require('../dist/threadpool.js');

var ThreadPool  = window.ThreadPool;
var expect      = require('expect.js');


/**
 * Wait until condition is fulfilled or max waiting time has passed.
 * @param {Function} conditionCb
 * @param {Number} maxWaitMs
 * @param {Function} fulfillCb
 */
function waitFor(conditionCb, maxWaitMs, fulfillCb) {
  function repeatingCheck() {
    if (conditionCb()) {
      clearInterval(checkInterval);
      clearTimeout(timeout);
      fulfillCb(true);
    }
  }

  function cancel() {
    clearInterval(checkInterval);
    fulfillCb(false);
  }

  var checkEveryMs = 10;
  var checkInterval = setInterval(repeatingCheck, checkEveryMs);
  var timeout = setTimeout(cancel, maxWaitMs);
}


describe('threadpool', function() {

  it('has been initialized', function() {
    expect(ThreadPool).to.be.a('function');
  });

  describe('workers', function() {

    it('are spawned', function(done) {
      var pool = new ThreadPool();
      var actionCalled = 0;

      var action = function(param, actionDone) {
        actionDone();
      };

      pool.run(action);
      pool.run(action);

      pool.done(function() {
        actionCalled++;
      });

      waitFor(function() { return actionCalled === 2; }, 500, function() {
        expect(actionCalled).to.equal(2);
        done();
      });
    });

    it('trigger start event', function(done) {
      var pool = new ThreadPool();
      var startEvents = 0;
      var doneCalled = false;

      var action = function(param, actionDone) {
        actionDone();
      };

      function startEventHandler() {
        startEvents++;
      }

      pool.run(action).start(startEventHandler);
      pool.run(action).start(startEventHandler);

      pool.done(function() {
        expect(startEvents).to.equal(2);
        if (doneCalled) { return; }

        doneCalled = true;
        done();
      });
    });

    it('trigger error event', function(done) {
      var pool = new ThreadPool();
      var errorEvents = 0;
      var poolError = 0;

      var action = function() {
        throw new Error('Test');
      };

      function errorEventHandler() {
        errorEvents++;
      }

      pool.run(action).error(errorEventHandler);
      pool.run(action).error(errorEventHandler);

      pool.error(function() {
        poolError++;

        expect(errorEvents).to.equal(poolError);
        if (errorEvents == 2) { done(); }
      });
    });

    it('can work asynchronously', function(done) {
      var pool = new ThreadPool();
      var actionCalled = 0;

      var action = function(param, actionDone) {
        thread.nextTick(actionDone);
      };

      pool.run(action);
      pool.run(action);

      pool.done(function() {
        actionCalled++;
      });

      waitFor(function() { return actionCalled === 2; }, 500, function() {
        expect(actionCalled).to.equal(2);
        done();
      });
    });

    it('can be re-used', function(done) {
      // only two threads
      var pool = new ThreadPool(2);
      var actionCalled = 0;

      var action = function(param, actionDone) {
        thread.nextTick(function() {
          actionDone();
        });
      };

      // queueing more jobs than there are threads
      pool.run(action);
      pool.run(action);
      pool.run(action);

      pool.done(function() {
        actionCalled++;
      });

      // TODO: Spy on WorkerFactory to make sure there are only two threads spawned

      pool.allDone(function() {
        try {
          expect(actionCalled).to.equal(3);
        } catch (error) {
          return done(error);
        }
        done();
      });
    });

  });


  it('allDone() is triggered once on overall completion', function(done) {
    var pool = new ThreadPool();
    var actionCalled = 0;
    var allDoneCalled = 0;

    var action = function(param, actionDone) {
      actionDone();
    };

    pool.run(action);
    pool.run(action);

    pool.done(function() {
      actionCalled++;
    });

    pool.allDone(function() {
      allDoneCalled++;
    });

    waitFor(function() { return allDoneCalled === 1; }, 500, function() {
      expect(allDoneCalled).to.equal(1);
      done();
    });
  });

});

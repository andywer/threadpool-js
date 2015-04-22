require('./helpers');
require('../dist/threadpool.min.js');

var ThreadPool  = window.ThreadPool;
var expect      = require('expect.js');


describe('threadpool', function() {

  it('has been initialized', function() {
    expect(ThreadPool).to.be.a('function');
  });

  describe('workers', function() {

    it('are spawned', function(done) {
      var pool = new ThreadPool()
        , actionCalled = 0;

      var action = function(param, actionDone) {
        actionDone();
      };

      pool.run(action);
      pool.run(action);

      pool.done(function() {
        actionCalled++;
      });

      setTimeout(function() {
        expect(actionCalled).to.equal(2);
        done();
      }, 500);
    });

    it('trigger start event', function(done) {
      var pool = new ThreadPool()
        , startEvents = 0
        , doneCalled = false;

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
      var pool = new ThreadPool()
        , errorEvents = 0
        , poolError = 0;

      var action = function(param, done) {
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

  });

});

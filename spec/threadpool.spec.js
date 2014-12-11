require('jasmine-expect');

describe('threadpool', function() {

  it('has been initialized', function() {
    expect(ThreadPool).toBeFunction();
  });

  describe('workers', function() {

    it('are spawned', function() {
      var pool = new ThreadPool()
        , actionCalled = 0
        , done = false;

      var action = function(param, done) {
        done();
      };

      runs(function() {
        pool.run(action);
        pool.run(action);

        pool.done(function() {
          actionCalled++;
        });

        setTimeout(function() {
          expect(actionCalled).toEqual(2);
          done = true;
        }, 500);
      });

      waitsFor(function() {
        return done;
      });
    });

    it('trigger start event', function() {
      var pool = new ThreadPool()
        , startEvents = 0
        , done = false;

      var action = function(param, done) {
        done();
      };

      runs(function() {
        function startEventHandler() {
          startEvents++;
        }

        pool.run(action).start(startEventHandler);
        pool.run(action).start(startEventHandler);

        pool.done(function() {
          expect(startEvents).toEqual(2);
          done = true;
        });
      });

      waitsFor(function() {
        return done;
      });
    });

    it('trigger error event', function() {
      var pool = new ThreadPool()
        , errorEvents = 0
        , poolError = 0
        , done = false;

      var action = function(param, done) {
        throw new Error('Test');
      };

      runs(function() {
        function errorEventHandler() {
          errorEvents++;
        }

        pool.run(action).error(errorEventHandler);
        pool.run(action).error(errorEventHandler);

        pool.error(function() {
          poolError++;

          expect(errorEvents).toEqual(poolError);
          if (errorEvents == 2) { done = true; }
        });
      });

      waitsFor(function() {
        return done;
      });
    });

  });

});

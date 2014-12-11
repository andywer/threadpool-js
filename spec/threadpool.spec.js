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

  });

});

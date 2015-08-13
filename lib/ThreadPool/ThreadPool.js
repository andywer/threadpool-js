'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Job = require('./Job');

var _Job2 = _interopRequireDefault(_Job);

var _Thread = require('./Thread');

var _Thread2 = _interopRequireDefault(_Thread);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var ThreadPool = (function () {

  /**
   *  @param {int} [size]       Optional. Number of threads. Default is `ThreadPool.defaultSize`.
   *  @param {string} [evalScriptUrl] Optional. URL to `evalWorker[.min].js` script (for IE compatibility).
   */

  function ThreadPool(size, evalScriptUrl) {
    _classCallCheck(this, ThreadPool);

    size = size || ThreadPool.defaultSize;
    evalScriptUrl = evalScriptUrl || '';

    this.size = size;
    this.evalWorkerUrl = evalScriptUrl;
    this.pendingJobs = [];
    this.idleThreads = [];
    this.activeThreads = [];

    this.callbacksDone = [];
    this.callbacksError = [];
    this.callbacksAllDone = [];

    for (var i = 0; i < size; i++) {
      this.idleThreads.push(new _Thread2['default'](this));
    }
  }

  //////////////////////
  // Set default values:

  _createClass(ThreadPool, [{
    key: 'terminateAll',
    value: function terminateAll() {
      for (var i = 0; i < this.idleThreads.length; i++) {
        this.idleThreads[i].terminate();
      }

      for (i = 0; i < this.activeThreads.length; i++) {
        if (this.activeThreads[i]) {
          this.activeThreads[i].terminate();
        }
      }
    }

    /**
     *  Usage: run ({string} WorkerScript [, {object|scalar} Parameter[, {object[]} BuffersToTransfer]] [, {function} doneCallback(returnValue)])
     *         - or -
     *         run ([{string[]} ImportScripts, ] {function} WorkerFunction(param, doneCB) [, {object|scalar} Parameter[, {objects[]} BuffersToTransfer]] [, {function} DoneCallback(result)])
     */
  }, {
    key: 'run',
    value: function run() {
      var self = this;

      ////////////////////
      // Parse arguments:

      var args = [].slice.call(arguments); // convert `arguments` to a fully functional array `args`
      var workerScript, workerFunction, importScripts, parameter, transferBuffers, doneCb;

      if (arguments.length < 1) {
        throw new Error('run(): Too few parameters.');
      }

      if (typeof args[0] === 'string') {
        // 1st usage example (see doc above)
        workerScript = args.shift();
      } else {
        // 2nd usage example (see doc above)
        if (typeof args[0] === 'object' && args[0] instanceof Array) {
          importScripts = args.shift();
        }
        if (args.length > 0 && typeof args[0] === 'function') {
          workerFunction = args.shift();
        } else {
          throw new Error('run(): Missing obligatory thread logic function.');
        }
      }

      if (args.length > 0 && typeof args[0] !== 'function') {
        parameter = args.shift();
      }
      if (args.length > 0 && typeof args[0] !== 'function') {
        transferBuffers = args.shift();
      }
      if (args.length > 0 && typeof args[0] === 'function') {
        doneCb = args.shift();
      }
      if (args.length > 0) {
        throw new Error('run(): Unrecognized parameters: ' + args);
      }

      ///////////////
      // Create job:

      var job;
      if (workerScript) {
        job = new _Job2['default'](workerScript, parameter, transferBuffers);
      } else {
        job = new _Job2['default'](workerFunction, parameter, transferBuffers);
        if (importScripts && importScripts.length > 0) {
          job.setImportScripts(importScripts);
        }
      }

      job.done(function () {
        self.jobIsDone(job);
      });

      if (doneCb) {
        job.done(doneCb);
      }

      ////////////
      // Run job:

      this.pendingJobs.push(job);

      utils.runDeferred(this.runJobs.bind(this));

      return job;
    }
  }, {
    key: 'runJobs',
    value: function runJobs() {
      if (this.idleThreads.length > 0 && this.pendingJobs.length > 0) {
        var thread = this.idleThreads.shift();
        this.activeThreads.push(thread);
        var job = this.pendingJobs.shift();
        thread.run(job);
      }
    }
  }, {
    key: 'onThreadDone',
    value: function onThreadDone(thread) {
      this.idleThreads.unshift(thread);
      this.activeThreads.splice(this.activeThreads.indexOf(thread), 1);
      this.runJobs();
    }
  }, {
    key: 'triggerDone',
    value: function triggerDone(result) {
      utils.callListeners(this.callbacksDone, [result]);
    }
  }, {
    key: 'triggerError',
    value: function triggerError(error) {
      utils.callListeners(this.callbacksError, [error]);
    }
  }, {
    key: 'clearDone',
    value: function clearDone() {
      this.callbacksDone = [];
    }
  }, {
    key: 'jobIsDone',
    value: function jobIsDone() {
      if (this.pendingJobs.length === 0) {
        utils.callListeners(this.callbacksAllDone, []);
        this.callbacksAllDone = [];
      }
    }

    /// @see Job.done()
  }, {
    key: 'done',
    value: function done(callback) {
      utils.addListener(this.callbacksDone, callback);
      return this;
    }

    /// @see Job.error()
  }, {
    key: 'error',
    value: function error(callback) {
      utils.addListener(this.callbacksError, callback);
      return this;
    }
  }, {
    key: 'allDone',
    value: function allDone(callback) {
      utils.addListener(this.callbacksAllDone, callback);
      return this;
    }
  }]);

  return ThreadPool;
})();

exports['default'] = ThreadPool;
ThreadPool.defaultSize = 8;
module.exports = exports['default'];
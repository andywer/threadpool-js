'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _eventemitter3 = require('eventemitter3');

var _eventemitter32 = _interopRequireDefault(_eventemitter3);

var _Job = require('./Job');

var _Job2 = _interopRequireDefault(_Job);

var _Thread = require('./Thread');

var _Thread2 = _interopRequireDefault(_Thread);

function runDeferred(callback) {
  setTimeout(callback, 0);
}

var ThreadPool = (function (_EventEmitter) {
  _inherits(ThreadPool, _EventEmitter);

  /**
   *  @param {int} [size]       Optional. Number of threads. Default is `ThreadPool.defaultSize`.
   *  @param {String} [evalScriptUrl] Optional. URL to `evalWorker[.min].js` script (for IE compatibility).
   */

  function ThreadPool(size, evalScriptUrl) {
    _classCallCheck(this, ThreadPool);

    _get(Object.getPrototypeOf(ThreadPool.prototype), 'constructor', this).call(this);

    size = size || ThreadPool.defaultSize;
    evalScriptUrl = evalScriptUrl || '';

    this.size = size;
    this.evalWorkerUrl = evalScriptUrl;
    this.pendingJobs = [];
    this.idleThreads = [];
    this.activeThreads = [];

    for (var i = 0; i < size; i++) {
      var thread = new _Thread2['default'](this);
      thread.on('done', this.handleThreadDone.bind(this, thread));

      this.idleThreads.push(thread);
    }
  }

  //////////////////////
  // Set default values:

  _createClass(ThreadPool, [{
    key: 'terminateAll',
    value: function terminateAll() {
      var allThreads = this.idleThreads.concat(this.activeThreads);

      allThreads.forEach(function (thread) {
        thread.terminate();
      });
    }

    /**
     * Usage: run ({String} WorkerScript [, {Object|scalar} Parameter[, {Object[]} BuffersToTransfer]] [, {Function} doneCallback(returnValue)])
     *        - or -
     *        run ([{String[]} ImportScripts, ] {Function} WorkerFunction(param, doneCB) [, {Object|scalar} Parameter[, {Object[]} BuffersToTransfer]] [, {Function} DoneCallback(result)])
     *
     * @return Job
     */
  }, {
    key: 'run',
    value: function run() {
      ////////////////////
      // Parse arguments:

      var workerScript, workerFunction, importScripts, parameter, transferBuffers, doneCb;
      var job;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (args.length < 1) {
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

      if (workerScript) {
        job = new _Job2['default'](workerScript, parameter, transferBuffers);
      } else {
        job = new _Job2['default'](workerFunction, parameter, transferBuffers);
        if (importScripts && importScripts.length > 0) {
          job.setImportScripts(importScripts);
        }
      }

      if (doneCb) {
        job.on('done', doneCb);
      }

      ////////////
      // Run job:

      this.pendingJobs.push(job);
      runDeferred(this.runJobs.bind(this));

      return job;
    }

    /** for internal use only */
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

    /** for internal use only */
  }, {
    key: 'handleThreadDone',
    value: function handleThreadDone(thread) {
      this.idleThreads.unshift(thread);
      this.activeThreads.splice(this.activeThreads.indexOf(thread), 1);
      this.runJobs();

      if (this.pendingJobs.length === 0 && this.activeThreads.length === 0) {
        this.emit('allDone');
      }
    }

    /** @deprecated Use .removeAllListeners('done') instead */
  }, {
    key: 'clearDone',
    value: function clearDone() {
      this.removeAllListeners('done');
    }

    /** Shortcut for .on('done', callback) */
  }, {
    key: 'done',
    value: function done(callback) {
      return this.on('done', callback);
    }

    /** Shortcut for .on('error', callback) */
  }, {
    key: 'error',
    value: function error(callback) {
      return this.on('error', callback);
    }

    /** Shortcut for .on('allDone', callback) */
  }, {
    key: 'allDone',
    value: function allDone(callback) {
      return this.once('allDone', callback);
    }
  }]);

  return ThreadPool;
})(_eventemitter32['default']);

exports['default'] = ThreadPool;
ThreadPool.defaultSize = 8;
module.exports = exports['default'];
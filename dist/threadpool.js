(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global define*/
'use strict';

/**
 *  Simple threadpool implementation based on web workers.
 *  Loosely based on: http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool
 *
 *  @author Andy Wermke <andy@dev.next-step-software.com>
 *  @see  https://github.com/andywer/threadpool-js
 */

if ((typeof Worker === 'undefined' || Worker === null) && console) {
  console.log('Warning: Browser does not support web workers.');
}

var ThreadPool = require('./ThreadPool/ThreadPool');

if (typeof define === 'function') {
  // require.js:
  define([], function () {
    return ThreadPool;
  });
} else if (typeof module === 'object') {
  module.exports = ThreadPool;
}

if (typeof window === 'object') {
  window.ThreadPool = ThreadPool;
}
},{"./ThreadPool/ThreadPool":4}],2:[function(require,module,exports){
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

function arrayEquals(a, b) {
  return !(a < b || a > b);
}

var Job = (function (_EventEmitter) {
  _inherits(Job, _EventEmitter);

  /**
   *  @param {String} script              Script filename or function.
   *  @param {Object|Array} [param]       Optional. Parameter (or array of parameters) to be passed to the thread or false/undefined.
   *  @param {Object[]} [transferBuffers] Optional. Array of buffers to be transferred to the worker context.
   */

  function Job(script, param, transferBuffers) {
    _classCallCheck(this, Job);

    _get(Object.getPrototypeOf(Job.prototype), 'constructor', this).call(this);

    this.param = param;
    this.transferBuffers = transferBuffers;
    this.importScripts = [];

    if (typeof script === 'function') {
      var funcStr = script.toString();
      this.scriptArgs = funcStr.substring(funcStr.indexOf('(') + 1, funcStr.indexOf(')')).split(',');
      this.scriptBody = funcStr.substring(funcStr.indexOf('{') + 1, funcStr.lastIndexOf('}'));
      this.scriptFile = null;
    } else {
      this.scriptArgs = null;
      this.scriptBody = null;
      this.scriptFile = script;
    }
  }

  _createClass(Job, [{
    key: 'getParameter',
    value: function getParameter() {
      return this.param;
    }
  }, {
    key: 'getImportScripts',
    value: function getImportScripts() {
      return this.importScripts;
    }
  }, {
    key: 'setImportScripts',
    value: function setImportScripts(scripts) {
      this.importScripts = scripts;
    }
  }, {
    key: 'getBuffersToTransfer',
    value: function getBuffersToTransfer() {
      return this.transferBuffers;
    }

    /**
     *  @return {Object} Object: { args: ["argument name", ...], body: "<code>" }
     *      Usage:  var f = Function.apply(null, args.concat(body));
     *          (`Function.apply()` replaces `new Function()`)
     */
  }, {
    key: 'getFunction',
    value: function getFunction() {
      if (!this.scriptArgs) {
        return null;
      }

      return {
        args: this.scriptArgs,
        body: this.scriptBody
      };
    }
  }, {
    key: 'getScriptFile',
    value: function getScriptFile() {
      return this.scriptFile;
    }

    /// @return True if `otherJob` uses the same function / same script as this job.
  }, {
    key: 'functionallyEquals',
    value: function functionallyEquals(otherJob) {
      return otherJob && otherJob instanceof Job && arrayEquals(otherJob.scriptArgs, this.scriptArgs) && otherJob.body === this.body && otherJob.scriptFile === this.scriptFile;
    }

    /**
     *  Adds a callback function that is called when the job is about to start.
     *  @param {Function} callback
     *    function(result). `result` is the result value/object returned by the thread.
     */
  }, {
    key: 'start',
    value: function start(callback) {
      return this.on('start', callback);
    }

    /**
     *  Adds a callback function that is called when the job has been (successfully) finished.
     *  @param {Function} callback
     *    function(result). `result` is the result value/object returned by the thread.
     */
  }, {
    key: 'done',
    value: function done(callback) {
      return this.on('done', callback);
    }

    /**
     *  Adds a callback function that is called if the job fails.
     *  @param {Function} callback
     *    function(error). `error` is an instance of `Error`.
     */
  }, {
    key: 'error',
    value: function error(callback) {
      return this.on('error', callback);
    }
  }]);

  return Job;
})(_eventemitter32['default']);

exports['default'] = Job;
module.exports = exports['default'];
},{"eventemitter3":8}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _eventemitter3 = require('eventemitter3');

var _eventemitter32 = _interopRequireDefault(_eventemitter3);

var _WorkerFactory = require('./WorkerFactory');

var _WorkerFactory2 = _interopRequireDefault(_WorkerFactory);

var Thread = (function (_EventEmitter) {
  _inherits(Thread, _EventEmitter);

  function Thread(threadPool) {
    _classCallCheck(this, Thread);

    _get(Object.getPrototypeOf(Thread.prototype), 'constructor', this).call(this);

    this.threadPool = threadPool;
    this.factory = new _WorkerFactory2['default']({ evalWorkerUrl: threadPool.evalWorkerUrl });

    this.worker = null;
    this.currentJob = null;
    this.lastJob = null;
  }

  _createClass(Thread, [{
    key: 'terminate',
    value: function terminate() {
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
      }
    }
  }, {
    key: 'run',
    value: function run(job) {
      var _this = this;

      var needToInitWorker = true;
      var transferBuffers = job.getBuffersToTransfer() || [];

      this.currentJob = job;
      this.factory.once('new', function (worker) {
        _this.wireEventListeners(worker, job);
      });

      if (this.worker) {
        if (this.lastJob && this.lastJob.functionallyEquals(job)) {
          needToInitWorker = false;
        } else {
          this.worker.terminate();
          this.worker = null;
        }
      }

      job.emit('start');

      try {
        if (needToInitWorker) {
          if (job.getScriptFile()) {
            this.worker = this.factory.runScriptFile(job.getScriptFile(), job.getParameter(), transferBuffers);
          } else {
            this.worker = this.factory.runCode(job.getFunction(), job.getParameter(), job.getImportScripts(), transferBuffers);
          }
        } else {
          this.wireEventListeners(this.worker, job, true);

          if (job.getScriptFile()) {
            this.factory.passParamsToWorkerScript(this.worker, job.getParameter(), transferBuffers);
          } else {
            this.factory.passParamsToGenericWorker(this.worker, job.getFunction(), job.getParameter(), job.getImportScripts(), transferBuffers);
          }
        }
      } finally {
        // always remove all listeners (for this job), so they cannot be triggered when this function is later
        // called with a different job
        this.factory.removeAllListeners('new');
      }
    }
  }, {
    key: 'wireEventListeners',
    value: function wireEventListeners(worker, job) {
      var removeExisting = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      if (removeExisting) {
        worker.removeAllListeners('message');
        worker.removeAllListeners('error');
      }

      worker.on('message', this.handleSuccess.bind(this, job));
      worker.on('error', this.handleError.bind(this, job));
    }
  }, {
    key: 'handleCompletion',
    value: function handleCompletion(job) {
      this.currentJob = null;
      this.lastJob = job;

      this.emit('done', job);
    }
  }, {
    key: 'handleSuccess',
    value: function handleSuccess(job, event) {
      this.currentJob.emit('done', event.data);
      this.threadPool.emit('done', event.data);
      this.handleCompletion(job);
    }
  }, {
    key: 'handleError',
    value: function handleError(job, errorEvent) {
      this.currentJob.emit('error', errorEvent);
      this.threadPool.emit('error', errorEvent);
      this.handleCompletion(job);
    }
  }]);

  return Thread;
})(_eventemitter32['default']);

exports['default'] = Thread;
module.exports = exports['default'];
},{"./WorkerFactory":5,"eventemitter3":8}],4:[function(require,module,exports){
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
},{"./Job":2,"./Thread":3,"eventemitter3":8}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _eventemitter3 = require('eventemitter3');

var _eventemitter32 = _interopRequireDefault(_eventemitter3);

var _WorkerWrapper = require('./WorkerWrapper');

var _WorkerWrapper2 = _interopRequireDefault(_WorkerWrapper);

var _genericWorker = require('./../genericWorker');

var _genericWorker2 = _interopRequireDefault(_genericWorker);

var genericWorkerDataUri = _genericWorker2['default'].dataUri;
var genericWorkerCode = _genericWorker2['default'].genericWorkerCode;

function runningInIE() {
  var olderIE = window.navigator.userAgent.indexOf('MSIE ') > -1;
  var newerIE = window.navigator.userAgent.indexOf('Trident/') > -1;

  return olderIE || newerIE;
}

var WorkerFactory = (function (_EventEmitter) {
  _inherits(WorkerFactory, _EventEmitter);

  function WorkerFactory(options) {
    _classCallCheck(this, WorkerFactory);

    _get(Object.getPrototypeOf(WorkerFactory.prototype), 'constructor', this).call(this);

    this.evalWorkerUrl = options.evalWorkerUrl;
  }

  _createClass(WorkerFactory, [{
    key: 'runScriptFile',
    value: function runScriptFile(url, parameter) {
      var transferBuffers = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

      var worker = new _WorkerWrapper2['default'](url);
      this.emit('new', worker);

      this.passParamsToWorkerScript(worker, parameter, transferBuffers);

      return worker;
    }
  }, {
    key: 'runCode',
    value: function runCode(fn, parameter) {
      var importScripts = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
      var transferBuffers = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];

      var worker;

      try {
        worker = new _WorkerWrapper2['default'](genericWorkerDataUri);
      } catch (error) {
        // Try to create the worker using evalworker.js if on IE
        if (runningInIE()) {
          if (!this.evalWorkerUrl) {
            throw new Error('No eval worker script set (required for IE compatibility).');
          }

          worker = new _WorkerWrapper2['default'](this.evalWorkerUrl);

          // let the worker run the initialization code
          worker.postMessage(genericWorkerCode);
        } else {
          throw error;
        }
      }

      this.emit('new', worker);

      this.passParamsToGenericWorker(worker, fn, parameter, importScripts, transferBuffers);

      return worker;
    }
  }, {
    key: 'passParamsToWorkerScript',
    value: function passParamsToWorkerScript(worker, parameter, transferBuffers) {
      worker.postMessage(parameter, transferBuffers);
    }
  }, {
    key: 'passParamsToGenericWorker',
    value: function passParamsToGenericWorker(worker, fn, parameter, importScripts, transferBuffers) {
      worker.postMessage({
        'function': fn,
        'importScripts': importScripts,
        'parameter': parameter
      }, transferBuffers);
    }
  }]);

  return WorkerFactory;
})(_eventemitter32['default']);

exports['default'] = WorkerFactory;
module.exports = exports['default'];
},{"./../genericWorker":7,"./WorkerWrapper":6,"eventemitter3":8}],6:[function(require,module,exports){
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

/**
 * Wrapping the WebWorker in an event emitter
 * (Because removeAllListeners() is quite a nice feature...)
 */

var WorkerWrapper = (function (_EventEmitter) {
  _inherits(WorkerWrapper, _EventEmitter);

  function WorkerWrapper(url) {
    _classCallCheck(this, WorkerWrapper);

    _get(Object.getPrototypeOf(WorkerWrapper.prototype), 'constructor', this).call(this);

    var worker = new Worker(url);
    this.worker = worker;

    worker.addEventListener('message', this.emit.bind(this, 'message'));
    worker.addEventListener('error', this.emit.bind(this, 'error'));
  }

  _createClass(WorkerWrapper, [{
    key: 'postMessage',
    value: function postMessage() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this.worker.postMessage.apply(this.worker, args);
    }
  }, {
    key: 'terminate',
    value: function terminate() {
      return this.worker.terminate();
    }
  }]);

  return WorkerWrapper;
})(_eventemitter32['default']);

exports['default'] = WorkerWrapper;
module.exports = exports['default'];
},{"eventemitter3":8}],7:[function(require,module,exports){
'use strict';

/*eslint-disable */
Object.defineProperty(exports, '__esModule', {
  value: true
});
var genericWorkerCode = 'this.onmessage = function (event) {' + '  var fnData = event.data.function;' + '  var scripts = event.data.importScripts;' + '  var fn = Function.apply(null, fnData.args.concat(fnData.body));' + '  if (importScripts && scripts.length > 0) {' + '    importScripts.apply(null, scripts);' + '  }' + '  fn(event.data.parameter, function(result) {' + '    postMessage(result);' + '  });' + '}';
/*eslint-enable */

var genericWorkerDataUri = 'data:text/javascript;charset=utf-8,' + encodeURI(genericWorkerCode);
var createBlobURL = window.createBlobURL || window.createObjectURL;

if (!createBlobURL) {
  var URL = window.URL || window.webkitURL;

  if (URL) {
    createBlobURL = URL.createObjectURL;
  } else {
    throw new Error('No Blob creation implementation found.');
  }
}

if (typeof BlobBuilder === 'function' && typeof createBlobURL === 'function') {
  var blobBuilder = new BlobBuilder();
  blobBuilder.append(genericWorkerCode);
  genericWorkerDataUri = createBlobURL(blobBuilder.getBlob());
} else if (typeof Blob === 'function' && typeof createBlobURL === 'function') {
  var blob = new Blob([genericWorkerCode], { type: 'text/javascript' });
  genericWorkerDataUri = createBlobURL(blob);
}

exports['default'] = {
  dataUri: genericWorkerDataUri,
  genericWorkerCode: genericWorkerCode
};
module.exports = exports['default'];
},{}],8:[function(require,module,exports){
'use strict';

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}]},{},[1]);

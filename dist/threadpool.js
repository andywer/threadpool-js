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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var Job = (function () {

  /**
   *  @param {string} script Script filename or function.
   *  @param {object|array} [param] Optional. Parameter (or array of parameters) to be passed to the thread or false/undefined.
   *  @param {object[]} [transferBuffers] Optional. Array of buffers to be transferred to the worker context.
   */

  function Job(script, param, transferBuffers) {
    _classCallCheck(this, Job);

    this.param = param;
    this.transferBuffers = transferBuffers;
    this.importScripts = [];
    this.callbacksStart = [];
    this.callbacksDone = [];
    this.callbacksError = [];

    if (typeof script === 'function') {
      var funcStr = script.toString();
      this.scriptArgs = funcStr.substring(funcStr.indexOf('(') + 1, funcStr.indexOf(')')).split(',');
      this.scriptBody = funcStr.substring(funcStr.indexOf('{') + 1, funcStr.lastIndexOf('}'));
      this.scriptFile = undefined;
    } else {
      this.scriptArgs = undefined;
      this.scriptBody = undefined;
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
     *  @return {object} Object: { args: ["argument name", ...], body: "<code>" }
     *      Usage:  var f = Function.apply(null, args.concat(body));
     *          (`Function.apply()` replaces `new Function()`)
     */
  }, {
    key: 'getFunction',
    value: function getFunction() {
      if (!this.scriptArgs) {
        return undefined;
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
      return otherJob && otherJob instanceof Job && utils.arrayEquals(otherJob.scriptArgs, this.scriptArgs) && otherJob.body === this.body && otherJob.scriptFile === this.scriptFile;
    }
  }, {
    key: 'triggerStart',
    value: function triggerStart() {
      utils.callListeners(this.callbacksStart, []);
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

    /**
     *  Adds a callback function that is called when the job is about to start.
     *  @param {function} callback
     *    function(result). `result` is the result value/object returned by the thread.
     */
  }, {
    key: 'start',
    value: function start(callback) {
      utils.addListener(this.callbacksStart, callback);
      return this;
    }

    /**
     *  Adds a callback function that is called when the job has been (successfully) finished.
     *  @param {function} callback
     *    function(result). `result` is the result value/object returned by the thread.
     */
  }, {
    key: 'done',
    value: function done(callback) {
      utils.addListener(this.callbacksDone, callback);
      return this;
    }

    /**
     *  Adds a callback function that is called if the job fails.
     *  @param {function} callback
     *    function(error). `error` is an instance of `Error`.
     */
  }, {
    key: 'error',
    value: function error(callback) {
      utils.addListener(this.callbacksError, callback);
      return this;
    }
  }]);

  return Job;
})();

exports['default'] = Job;
module.exports = exports['default'];
},{"./utils":5}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _genericWorker = require('./../genericWorker');

var _genericWorker2 = _interopRequireDefault(_genericWorker);

var genericWorkerDataUri = _genericWorker2['default'].dataUri;
var genericWorkerCode = _genericWorker2['default'].genericWorkerCode;

var Thread = (function () {
  function Thread(threadPool) {
    _classCallCheck(this, Thread);

    this.threadPool = threadPool;
    this.worker = undefined;
    this.currentJob = undefined;
    this.lastJob = undefined;
  }

  _createClass(Thread, [{
    key: 'terminate',
    value: function terminate() {
      if (this.worker) {
        this.worker.terminate();
        this.worker = undefined;
      }
    }
  }, {
    key: 'run',
    value: function run(job) {
      var needToInitWorker = true;
      var transferBuffers = job.getBuffersToTransfer() || [];

      this.currentJob = job;

      if (this.worker) {
        if (this.lastJob && this.lastJob.functionallyEquals(job)) {
          needToInitWorker = false;
        } else {
          this.worker.terminate();
          this.worker = null;
        }
      }

      job.triggerStart();

      if (job.getScriptFile()) {

        if (needToInitWorker) {
          this.worker = new Worker(job.getScriptFile());
          this.wireEventListeners(job);
        }

        this.worker.postMessage(job.getParameter(), transferBuffers);
      } else {

        if (needToInitWorker) {
          try {
            this.worker = new Worker(genericWorkerDataUri);
          } catch (err) {
            // make sure it's IE that we failed on
            var olderIE = window.navigator.userAgent.indexOf('MSIE ') > -1;
            var newerIE = window.navigator.userAgent.indexOf('Trident/') > -1;

            // Try to create the worker using evalworker.js as the bloburl bug workaround
            if (olderIE || newerIE) {
              if (!this.threadPool.evalWorkerUrl) {
                throw new Error('No eval worker script set (required for IE compatibility).');
              }

              this.worker = new Worker(this.threadPool.evalWorkerUrl);
              this.worker.postMessage(genericWorkerCode);
            } else {
              throw err;
            }
          }
          this.wireEventListeners(job);
        }

        this.worker.postMessage({
          'function': job.getFunction(),
          'importScripts': job.getImportScripts(),
          'parameter': job.getParameter()
        }, transferBuffers);
      }
    }
  }, {
    key: 'wireEventListeners',
    value: function wireEventListeners(job) {
      this.worker.addEventListener('message', this.handleSuccess.bind(this, job), false);
      this.worker.addEventListener('error', this.handleError.bind(this, job), false);
    }
  }, {
    key: 'handleCompletion',
    value: function handleCompletion(job) {
      this.currentJob = undefined;
      this.lastJob = job;
      this.threadPool.onThreadDone(this);
    }
  }, {
    key: 'handleSuccess',
    value: function handleSuccess(job, event) {
      this.currentJob.triggerDone(event.data);
      this.threadPool.triggerDone(event.data);
      this.handleCompletion(job);
    }
  }, {
    key: 'handleError',
    value: function handleError(job, errorEvent) {
      this.currentJob.triggerError(errorEvent);
      this.threadPool.triggerError(errorEvent);
      this.handleCompletion(job);
    }
  }]);

  return Thread;
})();

exports['default'] = Thread;
module.exports = exports['default'];
},{"./../genericWorker":6}],4:[function(require,module,exports){
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
},{"./Job":2,"./Thread":3,"./utils":5}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.arrayEquals = arrayEquals;
exports.addListener = addListener;
exports.callListeners = callListeners;
exports.runDeferred = runDeferred;

function arrayEquals(a, b) {
  return !(a < b || a > b);
}

function addListener(callbacksArray, callback) {
  if (typeof callback !== 'function') {
    throw new Error('Expected callback function as parameter.');
  }

  // Check that this callbacks has not yet been registered:
  for (var i = 0; i < callbacksArray.length; i++) {
    var cb = callbacksArray[i];
    if (cb === callback) {
      return;
    }
  }

  callbacksArray.push(callback);
}

function callListeners(callbacksArray, params) {
  for (var i = 0; i < callbacksArray.length; i++) {
    var cb = callbacksArray[i];
    cb.apply(null, params);
  }
}

function runDeferred(callback) {
  setTimeout(callback, 0);
}
},{}],6:[function(require,module,exports){
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
},{}]},{},[1]);

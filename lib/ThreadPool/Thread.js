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
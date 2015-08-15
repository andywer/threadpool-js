'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _WorkerFactory = require('./WorkerFactory');

var _WorkerFactory2 = _interopRequireDefault(_WorkerFactory);

var Thread = (function () {
  function Thread(threadPool) {
    _classCallCheck(this, Thread);

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
      this.threadPool.handleThreadDone(this, job);
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
})();

exports['default'] = Thread;
module.exports = exports['default'];
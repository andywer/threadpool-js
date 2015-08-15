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
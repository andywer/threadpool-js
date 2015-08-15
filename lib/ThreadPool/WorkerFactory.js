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
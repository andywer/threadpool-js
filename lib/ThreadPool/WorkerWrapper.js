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
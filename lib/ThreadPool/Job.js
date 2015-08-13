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
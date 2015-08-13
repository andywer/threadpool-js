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
   *  @param {String} script              Script filename or function.
   *  @param {Object|Array} [param]       Optional. Parameter (or array of parameters) to be passed to the thread or false/undefined.
   *  @param {Object[]} [transferBuffers] Optional. Array of buffers to be transferred to the worker context.
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
     *  @param {Function} callback
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
     *  @param {Function} callback
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
     *  @param {Function} callback
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

var utils = require('./utils');


/**
 *  @param {string} script Script filename or function.
 *  @param {object|array} [param] Optional. Parameter (or array of parameters) to be passed to the thread or false/undefined.
 *  @param {object[]} [transferBuffers] Optional. Array of buffers to be transferred to the worker context.
 */
var Job = function (script, param, transferBuffers) {
  this.param = param;
  this.transferBuffers = transferBuffers;
  this.importScripts = [];
  this.callbacksStart = [];
  this.callbacksDone = [];
  this.callbacksError = [];

  if (typeof script == "function") {
    var funcStr = script.toString();
    this.scriptArgs = funcStr.substring(funcStr.indexOf('(') + 1, funcStr.indexOf(')')).split(',');
    this.scriptBody = funcStr.substring(funcStr.indexOf('{') + 1, funcStr.lastIndexOf('}'));
    this.scriptFile = undefined;
  } else {
    this.scriptArgs = undefined;
    this.scriptBody = undefined;
    this.scriptFile = script;
  }
};

Job.prototype = {
  getParameter : function () {
    return this.param;
  },

  getImportScripts : function () {
    return this.importScripts;
  },

  setImportScripts : function (scripts) {
    this.importScripts = scripts;
  },

  getBuffersToTransfer : function () {
    return this.transferBuffers;
  },

  /**
   *  @return {object} Object: { args: ["argument name", ...], body: "<code>" }
   *      Usage:  var f = Function.apply(null, args.concat(body));
   *          (`Function.apply()` replaces `new Function()`)
   */
  getFunction : function () {
    if (!this.scriptArgs) {
      return undefined;
    }

    return {
      args : this.scriptArgs,
      body : this.scriptBody
    };
  },
  getScriptFile : function () {
    return this.scriptFile;
  },

  /// @return True if `otherJob` uses the same function / same script as this job.
  functionallyEquals : function (otherJob) {
    return otherJob && (otherJob instanceof Job) &&
      arrayEquals(otherJob.scriptArgs, this.scriptArgs) &&
      otherJob.body == this.body &&
      otherJob.scriptFile == this.scriptFile;
  },

  triggerStart : function() {
    utils.callListeners(this.callbacksStart, []);
  },

  triggerDone : function (result) {
    utils.callListeners(this.callbacksDone, [result]);
  },

  triggerError : function (error) {
    utils.callListeners(this.callbacksError, [error]);
  },

  /**
   *  Adds a callback function that is called when the job is about to start.
   *  @param {function} callback
   *    function(result). `result` is the result value/object returned by the thread.
   */
  start : function(callback) {
    utils.addListener(this.callbacksStart, callback);
    return this;
  },

  /**
   *  Adds a callback function that is called when the job has been (successfully) finished.
   *  @param {function} callback
   *    function(result). `result` is the result value/object returned by the thread.
   */
  done : function (callback) {
    utils.addListener(this.callbacksDone, callback);
    return this;
  },

  /**
   *  Adds a callback function that is called if the job fails.
   *  @param {function} callback
   *    function(error). `error` is an instance of `Error`.
   */
  error : function (callback) {
    utils.addListener(this.callbacksError, callback);
    return this;
  }
};

module.exports = Job;

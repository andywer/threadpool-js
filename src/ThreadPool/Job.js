'use strict';

import EventEmitter from 'eventemitter3';

function arrayEquals(a, b) {
  return !(a < b || a > b);
}

export default class Job extends EventEmitter {

  /**
   *  @param {String} script              Script filename or function.
   *  @param {Object|Array} [param]       Optional. Parameter (or array of parameters) to be passed to the thread or false/undefined.
   *  @param {Object[]} [transferBuffers] Optional. Array of buffers to be transferred to the worker context.
   */
  constructor(script, param, transferBuffers) {
    super();

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

  getParameter() {
    return this.param;
  }

  getImportScripts() {
    return this.importScripts;
  }

  setImportScripts(scripts) {
    this.importScripts = scripts;
  }

  getBuffersToTransfer() {
    return this.transferBuffers;
  }

  /**
   *  @return {Object} Object: { args: ["argument name", ...], body: "<code>" }
   *      Usage:  var f = Function.apply(null, args.concat(body));
   *          (`Function.apply()` replaces `new Function()`)
   */
  getFunction() {
    if (!this.scriptArgs) {
      return null;
    }

    return {
      args: this.scriptArgs,
      body: this.scriptBody
    };
  }

  getScriptFile() {
    return this.scriptFile;
  }

  /// @return True if `otherJob` uses the same function / same script as this job.
  functionallyEquals(otherJob) {
    return otherJob &&
      (otherJob instanceof Job) &&
      arrayEquals(otherJob.scriptArgs, this.scriptArgs) &&
      otherJob.body === this.body &&
      otherJob.scriptFile === this.scriptFile;
  }

  /**
   *  Adds a callback function that is called when the job is about to start.
   *  @param {Function} callback
   *    function(result). `result` is the result value/object returned by the thread.
   */
  start(callback) {
    return this.on('start', callback);
  }

  /**
   *  Adds a callback function that is called when the job has been (successfully) finished.
   *  @param {Function} callback
   *    function(result). `result` is the result value/object returned by the thread.
   */
  done(callback) {
    return this.on('done', callback);
  }

  /**
   *  Adds a callback function that is called if the job fails.
   *  @param {Function} callback
   *    function(error). `error` is an instance of `Error`.
   */
  error(callback) {
    return this.on('error', callback);
  }

}

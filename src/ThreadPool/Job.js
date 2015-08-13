'use strict';

import * as utils from './utils';


export default class Job {

  /**
   *  @param {string} script Script filename or function.
   *  @param {object|array} [param] Optional. Parameter (or array of parameters) to be passed to the thread or false/undefined.
   *  @param {object[]} [transferBuffers] Optional. Array of buffers to be transferred to the worker context.
   */
  constructor(script, param, transferBuffers) {
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
   *  @return {object} Object: { args: ["argument name", ...], body: "<code>" }
   *      Usage:  var f = Function.apply(null, args.concat(body));
   *          (`Function.apply()` replaces `new Function()`)
   */
  getFunction() {
    if (!this.scriptArgs) {
      return undefined;
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
    return otherJob && (otherJob instanceof Job) &&
      utils.arrayEquals(otherJob.scriptArgs, this.scriptArgs) &&
      otherJob.body === this.body &&
      otherJob.scriptFile === this.scriptFile;
  }

  triggerStart() {
    utils.callListeners(this.callbacksStart, []);
  }

  triggerDone(result) {
    utils.callListeners(this.callbacksDone, [result]);
  }

  triggerError(error) {
    utils.callListeners(this.callbacksError, [error]);
  }

  /**
   *  Adds a callback function that is called when the job is about to start.
   *  @param {function} callback
   *    function(result). `result` is the result value/object returned by the thread.
   */
  start(callback) {
    utils.addListener(this.callbacksStart, callback);
    return this;
  }

  /**
   *  Adds a callback function that is called when the job has been (successfully) finished.
   *  @param {function} callback
   *    function(result). `result` is the result value/object returned by the thread.
   */
  done(callback) {
    utils.addListener(this.callbacksDone, callback);
    return this;
  }

  /**
   *  Adds a callback function that is called if the job fails.
   *  @param {function} callback
   *    function(error). `error` is an instance of `Error`.
   */
  error(callback) {
    utils.addListener(this.callbacksError, callback);
    return this;
  }

}

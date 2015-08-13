'use strict';

import Job from './Job';
import Thread from './Thread';

import * as utils from './utils';


export default class ThreadPool {

  /**
   *  @param {int} [size]       Optional. Number of threads. Default is `ThreadPool.defaultSize`.
   *  @param {String} [evalScriptUrl] Optional. URL to `evalWorker[.min].js` script (for IE compatibility).
   */
  constructor(size, evalScriptUrl) {
    size = size || ThreadPool.defaultSize;
    evalScriptUrl = evalScriptUrl || '';

    this.size = size;
    this.evalWorkerUrl = evalScriptUrl;
    this.pendingJobs   = [];
    this.idleThreads   = [];
    this.activeThreads = [];

    this.callbacksDone    = [];
    this.callbacksError   = [];
    this.callbacksAllDone = [];

    for (var i = 0; i < size; i++) {
      this.idleThreads.push(new Thread(this));
    }
  }

  terminateAll() {
    var allThreads = this.idleThreads.concat(this.activeThreads);

    allThreads.forEach(thread => {
      thread.terminate();
    });
  }

  /**
   *  Usage: run ({String} WorkerScript [, {Object|scalar} Parameter[, {Object[]} BuffersToTransfer]] [, {Function} doneCallback(returnValue)])
   *         - or -
   *         run ([{String[]} ImportScripts, ] {Function} WorkerFunction(param, doneCB) [, {Object|scalar} Parameter[, {Object[]} BuffersToTransfer]] [, {Function} DoneCallback(result)])
   */
  run(...args) {
    ////////////////////
    // Parse arguments:

    var workerScript, workerFunction, importScripts, parameter, transferBuffers, doneCb;
    var job;

    if (args.length < 1) {
      throw new Error('run(): Too few parameters.');
    }

    if (typeof args[0] === 'string') {
      // 1st usage example (see doc above)
      workerScript = args.shift();
    } else {
      // 2nd usage example (see doc above)
      if (typeof args[0] === 'object' && args[0] instanceof Array) {
        importScripts = args.shift();
      }
      if (args.length > 0 && typeof args[0] === 'function') {
        workerFunction = args.shift();
      } else {
        throw new Error('run(): Missing obligatory thread logic function.');
      }
    }

    if (args.length > 0 && typeof args[0] !== 'function') {
      parameter = args.shift();
    }
    if (args.length > 0 && typeof args[0] !== 'function') {
      transferBuffers = args.shift();
    }
    if (args.length > 0 && typeof args[0] === 'function') {
      doneCb = args.shift();
    }
    if (args.length > 0) {
      throw new Error('run(): Unrecognized parameters: ' + args);
    }

    ///////////////
    // Create job:

    if (workerScript) {
      job = new Job(workerScript, parameter, transferBuffers);
    } else {
      job = new Job(workerFunction, parameter, transferBuffers);
      if (importScripts && importScripts.length > 0) {
        job.setImportScripts(importScripts);
      }
    }

    job.done(this.jobIsDone.bind(this, job));

    if (doneCb) {
      job.done(doneCb);
    }

    ////////////
    // Run job:

    this.pendingJobs.push(job);
    utils.runDeferred(this.runJobs.bind(this));

    return job;
  }

  runJobs() {
    if (this.idleThreads.length > 0 && this.pendingJobs.length > 0) {
      var thread = this.idleThreads.shift();
      this.activeThreads.push(thread);

      var job = this.pendingJobs.shift();
      thread.run(job);
    }
  }

  onThreadDone(thread) {
    this.idleThreads.unshift(thread);
    this.activeThreads.splice(this.activeThreads.indexOf(thread), 1);
    this.runJobs();
  }

  triggerDone(result) {
    utils.callListeners(this.callbacksDone, [result]);
  }
  triggerError(error) {
    utils.callListeners(this.callbacksError, [error]);
  }

  clearDone() {
    this.callbacksDone = [];
  }

  jobIsDone() {
    if (this.pendingJobs.length === 0) {
      utils.callListeners(this.callbacksAllDone, []);
      this.callbacksAllDone = [];
    }
  }

  /** @see Job.done() */
  done(callback) {
    utils.addListener(this.callbacksDone, callback);
    return this;
  }
  /** @see Job.error() */
  error(callback) {
    utils.addListener(this.callbacksError, callback);
    return this;
  }
  allDone(callback) {
    utils.addListener(this.callbacksAllDone, callback);
    return this;
  }
}


//////////////////////
// Set default values:

ThreadPool.defaultSize = 8;

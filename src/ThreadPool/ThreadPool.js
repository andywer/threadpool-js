'use strict';

import EventEmitter from 'eventemitter3';

import Job from './Job';
import Thread from './Thread';


function runDeferred(callback) {
  setTimeout(callback, 0);
}

export default class ThreadPool extends EventEmitter {

  /**
   *  @param {int} [size]       Optional. Number of threads. Default is `ThreadPool.defaultSize`.
   *  @param {String} [evalScriptUrl] Optional. URL to `evalWorker[.min].js` script (for IE compatibility).
   */
  constructor(size, evalScriptUrl) {
    super();

    size = size || ThreadPool.defaultSize;
    evalScriptUrl = evalScriptUrl || '';

    this.size = size;
    this.evalWorkerUrl = evalScriptUrl;
    this.pendingJobs   = [];
    this.idleThreads   = [];
    this.activeThreads = [];

    for (var i = 0; i < size; i++) {
      let thread = new Thread(this);
      thread.on('done', this.handleThreadDone.bind(this, thread));

      this.idleThreads.push(thread);
    }
  }

  terminateAll() {
    var allThreads = this.idleThreads.concat(this.activeThreads);

    allThreads.forEach(thread => {
      thread.terminate();
    });
  }

  /**
   * Usage: run ({String} WorkerScript [, {Object|scalar} Parameter[, {Object[]} BuffersToTransfer]] [, {Function} doneCallback(returnValue)])
   *        - or -
   *        run ([{String[]} ImportScripts, ] {Function} WorkerFunction(param, doneCB) [, {Object|scalar} Parameter[, {Object[]} BuffersToTransfer]] [, {Function} DoneCallback(result)])
   *
   * @return Job
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

    if (doneCb) {
      job.on('done', doneCb);
    }

    ////////////
    // Run job:

    this.pendingJobs.push(job);
    runDeferred(this.runJobs.bind(this));

    return job;
  }

  /** for internal use only */
  runJobs() {
    if (this.idleThreads.length > 0 && this.pendingJobs.length > 0) {
      var thread = this.idleThreads.shift();
      this.activeThreads.push(thread);

      var job = this.pendingJobs.shift();
      thread.run(job);
    }
  }

  /** for internal use only */
  handleThreadDone(thread) {
    this.idleThreads.unshift(thread);
    this.activeThreads.splice(this.activeThreads.indexOf(thread), 1);
    this.runJobs();

    if (this.pendingJobs.length === 0 && this.activeThreads.length === 0) {
      this.emit('allDone');
    }
  }

  /** @deprecated Use .removeAllListeners('done') instead */
  clearDone() {
    this.removeAllListeners('done');
  }

  /** Shortcut for .on('done', callback) */
  done(callback) {
    return this.on('done', callback);
  }

  /** Shortcut for .on('error', callback) */
  error(callback) {
    return this.on('error', callback);
  }

  /** Shortcut for .on('allDone', callback) */
  allDone(callback) {
    return this.once('allDone', callback);
  }
}


//////////////////////
// Set default values:

ThreadPool.defaultSize = 8;

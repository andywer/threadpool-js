'use strict';

import genericWorker from './../genericWorker';

var genericWorkerDataUri = genericWorker.dataUri;
var genericWorkerCode = genericWorker.genericWorkerCode;


export default class Thread {

  constructor(threadPool) {
    this.threadPool = threadPool;
    this.worker     = null;
    this.currentJob = null;
    this.lastJob    = null;
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  run(job) {
    var needToInitWorker = true;
    var transferBuffers = job.getBuffersToTransfer() || [];

    this.currentJob = job;


    if (this.worker) {
      if (this.lastJob && this.lastJob.functionallyEquals(job)) {
        needToInitWorker = false;
      } else {
        this.worker.terminate();
        this.worker = null;
      }
    }

    job.emit('start');

    if (job.getScriptFile()) {

      if (needToInitWorker) {
        this.worker = new Worker(job.getScriptFile());
        this.wireEventListeners(job);
      }

      this.worker.postMessage(job.getParameter(), transferBuffers);

    } else {

      if (needToInitWorker) {
        try {
          this.worker = new Worker(genericWorkerDataUri);
        } catch(err) {
          // make sure it's IE that we failed on
          var olderIE = window.navigator.userAgent.indexOf('MSIE ') > -1;
          var newerIE = window.navigator.userAgent.indexOf('Trident/') > -1;

          // Try to create the worker using evalworker.js as the bloburl bug workaround
          if (olderIE || newerIE) {
            if (!this.threadPool.evalWorkerUrl) {
              throw new Error('No eval worker script set (required for IE compatibility).');
            }

            this.worker = new Worker(this.threadPool.evalWorkerUrl);
            this.worker.postMessage(genericWorkerCode);
          } else {
            throw err;
          }
        }
        this.wireEventListeners(job);
      }

      this.worker.postMessage({
        'function'      : job.getFunction(),
        'importScripts' : job.getImportScripts(),
        'parameter'     : job.getParameter()
      }, transferBuffers);

    }
  }


  wireEventListeners(job) {
    this.worker.addEventListener('message', this.handleSuccess.bind(this, job), false);
    this.worker.addEventListener('error', this.handleError.bind(this, job), false);
  }

  handleCompletion(job) {
    this.currentJob = null;
    this.lastJob    = job;
    this.threadPool.onThreadDone(this);
  }

  handleSuccess(job, event) {
    this.currentJob.emit('done', event.data);
    this.threadPool.emit('done', event.data);
    this.handleCompletion(job);
  }

  handleError(job, errorEvent) {
    this.currentJob.emit('error', errorEvent);
    this.threadPool.emit('error', errorEvent);
    this.handleCompletion(job);
  }

}

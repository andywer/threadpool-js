'use strict';

import genericWorker from './../genericWorker';

var genericWorkerDataUri = genericWorker.dataUri;
var genericWorkerCode = genericWorker.genericWorkerCode;


export default class Thread {

  constructor(threadPool) {
    this.threadPool = threadPool;
    this.worker     = undefined;
    this.currentJob = undefined;
    this.lastJob    = undefined;
  }

  terminate() {
    if(this.worker) {
      this.worker.terminate();
      this.worker = undefined;
    }
  }

  run(job) {
    var self = this;
    var needToInitWorker = true;
    var transferBuffers = job.getBuffersToTransfer();

    this.currentJob = job;

    if (!transferBuffers) {
      transferBuffers = [];
    }

    function complete () {
      self.currentJob = undefined;
      self.lastJob  = job;
      self.threadPool.onThreadDone(self);
    }

    function success (event) {
      self.currentJob.triggerDone(event.data);
      self.threadPool.triggerDone(event.data);
      complete();
    }

    function error (errorEvent) {
      self.currentJob.triggerError(errorEvent);
      self.threadPool.triggerError(errorEvent);
      complete();
    }


    if (this.worker) {
      if (this.lastJob && this.lastJob.functionallyEquals(job)) {
        needToInitWorker = false;
      } else {
        this.worker.terminate();
        this.worker = undefined;
      }
    }

    job.triggerStart();

    if (job.getScriptFile()) {
      if (needToInitWorker) {
        this.worker = new Worker(job.getScriptFile());
        this.worker.addEventListener('message', success, false);
        this.worker.addEventListener('error', error, false);
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
        this.worker.addEventListener('message', success, false);
        this.worker.addEventListener('error', error, false);
      }

      this.worker.postMessage({
        'function'      : job.getFunction(),
        'importScripts' : job.getImportScripts(),
        'parameter'     : job.getParameter()
      }, transferBuffers);

    }
  }

}

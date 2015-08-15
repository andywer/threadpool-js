import EventEmitter from 'eventemitter3';

/**
 * Wrapping the WebWorker in an event emitter
 * (Because removeAllListeners() is quite a nice feature...)
 */
export default class WorkerWrapper extends EventEmitter {
  constructor(url) {
    super();

    const worker = new Worker(url);
    this.worker = worker;

    worker.addEventListener('message', this.emit.bind(this, 'message'));
    worker.addEventListener('error', this.emit.bind(this, 'error'));
  }

  postMessage(...args) {
    this.worker.postMessage.apply(this.worker, args);
  }

  terminate() {
    return this.worker.terminate();
  }
}

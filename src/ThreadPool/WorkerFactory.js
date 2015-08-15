
import EventEmitter from 'eventemitter3';
import Worker from './WorkerWrapper';
import genericWorker from './../genericWorker';

var genericWorkerDataUri = genericWorker.dataUri;
var genericWorkerCode = genericWorker.genericWorkerCode;


function runningInIE() {
  const olderIE = window.navigator.userAgent.indexOf('MSIE ') > -1;
  const newerIE = window.navigator.userAgent.indexOf('Trident/') > -1;

  return olderIE || newerIE;
}


export default class WorkerFactory extends EventEmitter {

  constructor(options) {
    super();

    this.evalWorkerUrl = options.evalWorkerUrl;
  }

  runScriptFile(url, parameter, transferBuffers = []) {
    const worker = new Worker(url);
    this.emit('new', worker);

    this.passParamsToWorkerScript(worker, parameter, transferBuffers);

    return worker;
  }

  runCode(fn, parameter, importScripts = [], transferBuffers = []) {
    var worker;

    try {
      worker = new Worker(genericWorkerDataUri);
    } catch (error) {
      // Try to create the worker using evalworker.js if on IE
      if (runningInIE()) {
        if (!this.evalWorkerUrl) {
          throw new Error('No eval worker script set (required for IE compatibility).');
        }

        worker = new Worker(this.evalWorkerUrl);

        // let the worker run the initialization code
        worker.postMessage(genericWorkerCode);
      } else {
        throw error;
      }
    }

    this.emit('new', worker);

    this.passParamsToGenericWorker(worker, fn, parameter, importScripts, transferBuffers);

    return worker;
  }

  passParamsToWorkerScript(worker, parameter, transferBuffers) {
    worker.postMessage(parameter, transferBuffers);
  }

  passParamsToGenericWorker(worker, fn, parameter, importScripts, transferBuffers) {
    worker.postMessage({
      'function'      : fn,
      'importScripts' : importScripts,
      'parameter'     : parameter
    }, transferBuffers);
  }

}

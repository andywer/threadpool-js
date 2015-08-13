'use strict';

/*eslint-disable */
Object.defineProperty(exports, '__esModule', {
  value: true
});
var genericWorkerCode = 'this.onmessage = function (event) {' + '  var fnData = event.data.function;' + '  var scripts = event.data.importScripts;' + '  var fn = Function.apply(null, fnData.args.concat(fnData.body));' + '  if (importScripts && scripts.length > 0) {' + '    importScripts.apply(null, scripts);' + '  }' + '  fn(event.data.parameter, function(result) {' + '    postMessage(result);' + '  });' + '}';
/*eslint-enable */

var genericWorkerDataUri = 'data:text/javascript;charset=utf-8,' + encodeURI(genericWorkerCode);
var createBlobURL = window.createBlobURL || window.createObjectURL;

if (!createBlobURL) {
  var URL = window.URL || window.webkitURL;

  if (URL) {
    createBlobURL = URL.createObjectURL;
  } else {
    throw new Error('No Blob creation implementation found.');
  }
}

if (typeof BlobBuilder === 'function' && typeof createBlobURL === 'function') {
  var blobBuilder = new BlobBuilder();
  blobBuilder.append(genericWorkerCode);
  genericWorkerDataUri = createBlobURL(blobBuilder.getBlob());
} else if (typeof Blob === 'function' && typeof createBlobURL === 'function') {
  var blob = new Blob([genericWorkerCode], { type: 'text/javascript' });
  genericWorkerDataUri = createBlobURL(blob);
}

exports['default'] = {
  dataUri: genericWorkerDataUri,
  genericWorkerCode: genericWorkerCode
};
module.exports = exports['default'];
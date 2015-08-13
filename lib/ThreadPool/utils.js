'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.arrayEquals = arrayEquals;
exports.addListener = addListener;
exports.callListeners = callListeners;
exports.runDeferred = runDeferred;

function arrayEquals(a, b) {
  return !(a < b || a > b);
}

function addListener(callbacksArray, callback) {
  if (typeof callback !== 'function') {
    throw new Error('Expected callback function as parameter.');
  }

  // Check that this callbacks has not yet been registered
  if (callbacksArray.indexOf(callback) === -1) {
    callbacksArray.push(callback);
  }
}

function callListeners(callbacksArray, params) {
  callbacksArray.forEach(function (callback) {
    callback.apply(null, params);
  });
}

function runDeferred(callback) {
  setTimeout(callback, 0);
}
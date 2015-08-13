'use strict';

export function arrayEquals(a, b) {
  return !(a < b || a > b);
}

export function addListener(callbacksArray, callback) {
  if (typeof callback !== 'function') {
    throw new Error('Expected callback function as parameter.');
  }

  // Check that this callbacks has not yet been registered
  if (callbacksArray.indexOf(callback) === -1) {
    callbacksArray.push(callback);
  }
}

export function callListeners(callbacksArray, params) {
  callbacksArray.forEach(callback => {
    callback.apply(null, params);
  });
}

export function runDeferred(callback) {
  setTimeout(callback, 0);
}

/*global define*/
'use strict';

/**
 *  Simple threadpool implementation based on web workers.
 *  Loosely based on: http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool
 *
 *  @author Andy Wermke <andy@dev.next-step-software.com>
 *  @see  https://github.com/andywer/threadpool-js
 */

if ((typeof Worker === 'undefined' || Worker === null) && console) {
  console.log('Warning: Browser does not support web workers.');
}

var ThreadPool = require('./ThreadPool/ThreadPool');

if (typeof define === 'function') {
  // require.js:
  define([], function () {
    return ThreadPool;
  });
} else if (typeof module === 'object') {
  module.exports = ThreadPool;
}

if (typeof window === 'object') {
  window.ThreadPool = ThreadPool;
}
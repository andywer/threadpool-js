
// Hack to make the library work with `webworker-threads`
// (since we can simply pass a function to the Worker constructor, but don't have blob building logic)

function FakeBlob (codeStrings) {
  this.codeString = codeStrings[0];
}

function fakeCreateBlobURL (fakeBlob) {
  return new Function(fakeBlob.codeString);
}

var window = {
  Blob: FakeBlob,
  createBlobURL: fakeCreateBlobURL,
  navigator: {
    userAgent: 'node.js'
  }
};

// neccessary, because `require('../src/threadpool')` already needs the Worker class
global.Worker = require('webworker-threads').Worker;
global.window = window;
global.Blob = FakeBlob;
global.createBlobURL = fakeCreateBlobURL;

module.exports = {
  ThreadPool: require('../lib'),
  Worker: global.Worker,
  window: window
};

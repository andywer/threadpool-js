## threadpool.js [![Build Status](https://travis-ci.org/andywer/threadpool-js.svg?branch=master)](https://travis-ci.org/andywer/threadpool-js) [![npm version](https://badge.fury.io/js/threadpool-js.svg)](http://badge.fury.io/js/threadpool-js) [![Bower version](https://badge.fury.io/bo/threadpool-js.svg)](http://badge.fury.io/bo/threadpool-js)

_threadpool.js_ is aimed to be a general-purpose multi-threading library for Javascript.
Its key features are *portability* and *ease of use*. The library can either be used in a stand-alone fashion or as a *[require.js](http://requirejs.org/)* module.

## Usage

You can add threadpool-js to your project using npm or bower:

```bash
npm install --save threadpool-js
# or
bower install --save threadpool-js
```

Or just by adding this script tag:

```html
<script type="text/javascript" src="http://andywer.github.io/threadpool-js/dist/threadpool.min.js"></script>
```

## Example use

Include the library at first. Just add the *threadpool.js* file to your project and include it per `<script>` tag.
Alternatively you may use *[require.js](http://requirejs.org/)* or require it as a node.js module when using *[browserify](http://browserify.org/)* or *[webpack](http://webpack.github.io/)*.

```javascript
// Init new threadpool with default size
var pool = new ThreadPool();

// Spawn two threads
pool
  .run(mythread, "Hello")
  .done(function(result) {
    document.write("Thread #1: " + result);
  });
pool
  .run(mythread, " World")
  .done(function(result) {
    document.write("Thread #2: " + result);
  });

// Hint: Keep in mind that you are free to use the done() and error() handlers
//       on single jobs and the whole pool!

pool.allDone(function() {
  document.write("All jobs are done.");
});

// Thread logic
function mythread (param, done) {
  done( param.toUpperCase() );
}
```

## Running external scripts

You can also choose to run another javascript file instead of passing a function:

```javascript
// Init new threadpool with default size
var pool = new ThreadPool();

// Spawn thread running another script file
pool
  .run("/path/to/script.js", { foo: 'bar' })
  .done(function(result) {
    console.log("Job finished and returned: ", result);
  });
```

## Using libraries in the worker code

Assume that you want to use jQuery in your thread code. You cannot manipulate the DOM from there, but you might need some convenience methods. You can import other Javascript files into the scope of your thread code like this:

```javascript
pool.run(["/path/to/jQuery.min.js"], function(param, done) { /* do something awesome */ });
```


## Support for transferable objects

If you want to pass large blobs to your workers efficiently, you may use a feature called [transferable objects](https://developer.mozilla.org/en/docs/Web/Guide/Performance/Using_web_workers#Passing_data_by_transferring_ownership_(transferable_objects)).

_threadpool-js_ supports them. Just pass the array of buffers to transfer (after the worker parameter) to the pool's `run` method:

```javascript
pool.run(mythread, {hash: "sha512", data: myUint8Array}, [myUint8Array.buffer]);
```


## Demo

Try the [samples](http://andywer.github.io/threadpool-js/samples/index.html).

(Use Chrome, Firefox, IE, or Opera)

Note: IE support experimental

## License

This library is published under the MIT license. See [LICENSE](https://raw.githubusercontent.com/andywer/threadpool-js/master/LICENSE) for details.

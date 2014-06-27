## threadpool.js

_threadpool.js_ is aimed to be a general-purpose multi-threading library for Javascript.
It's key features are *portability* and *ease of use*. The library can either be used in a stand-alone fashion or as a *[require.js](http://requirejs.org/)* module.

## Example use

Include the library at first. Just add the *threadpool.js* file to your project and include it per `<script>` tag.
Alternatively you may use *[require.js](http://requirejs.org/)*.

```javascript
// Init new threadpool with default size
var pool = new ThreadPool();

// Spawn two threads
pool.run(mythread, "Hello")
  .done(function(result) {
    document.write("Thread #1: " + result);
  });
pool.run(mythread, " World")
  .done(function(result) {
    document.write("Thread #2: " + result);
  });

// Thread logic
function mythread (param, done) {
  done( param.toUpperCase() );
}
```

## License

This library is published under the MIT license. See [LICENSE](https://raw.githubusercontent.com/andywer/threadpool-js/master/LICENSE) for details.


/**
 *  Simple threadpool implementation based on web workers.
 *  Loosely based on: http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool
 *  
 *  @author Andy Wermke <andy@dev.next-step-software.com>
 */

;
if(typeof Worker != "function") {
    console && console.log("Warning: Browser does not support web workers.");
}

(function() {
    var ThreadPool = function (size) {
        var _this = this;
        size = size || ThreadPool.defaultSize;
        
    };

    ThreadPool.defaultSize = 8;
    
    if(typeof define == "function") {
        // require.js:
        define([], ThreadPool);
    } else if(typeof window == "object") {
        window.ThreadPool = ThreadPool;
    }
})();


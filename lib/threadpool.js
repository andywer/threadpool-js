
/**
 *  Simple threadpool implementation based on web workers.
 *  Loosely based on: http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool
 *  
 *  @author Andy Wermke <andy@dev.next-step-software.com>
 *  @see    https://github.com/andywer/threadpool-js
 */

;
if(typeof Worker != "function") {
    console && console.log("Warning: Browser does not support web workers.");
}

(function() {
    
    var genericWorkerCode =
        'this.onmessage = function (event) {'+
        '    var fnData = event.data.function;'+
        '    var scripts = event.data.importScripts;'+
        '    var fn = Function.apply(null, fnData.args.concat(fnData.body));'+
        '    if(importScripts && importScripts.length > 0) {'+
        '        importScripts.apply(null, scripts);'+
        '    }'+
        '    fn(event.data.parameter, function(result) {'+
        '        postMessage(result);'+
        '    });'+
        '}';
    
    var genericWorkerDataUri = "data:text/javascript;charset=utf-8,"+encodeURI(genericWorkerCode);
    var createBlobURL = window.createBlobURL || window.createObjectURL;
    
    if(!createBlobURL && window.webkitURL) {
        createBlobURL = window.webkitURL.createObjectURL;
    }
    
    if(typeof BlobBuilder == "function" && typeof createBlobURL == "function") {
        var blobBuilder = new BlobBuilder();
        blobBuilder.append(genericWorkerCode);
        genericWorkerDataUri = createBlobURL( blobBuilder.getBlob() );
    } else if(typeof Blob == "function" && typeof createBlobURL == "function") {
        var blob = new Blob([ genericWorkerCode ], {type: 'text/javascript'});
        genericWorkerDataUri = createBlobURL( blob );
    }
    
    
    /**
     *  @param {script} Script filename or function.
     *  @param {param} Optional. Parameter (or array of parameters) to be passed to the thread or false/undefined.
     */
    var Job = function (script, param) {
        this.param = param;
        this.importScripts = [];
        this.callbacksDone = [];
        this.callbacksError = [];
        
        if(typeof script == "function") {
            var funcStr = script.toString();
            this.scriptArgs = funcStr.substring(funcStr.indexOf('(')+1, funcStr.indexOf(')')).split(',');
            this.scriptBody = funcStr.substring(funcStr.indexOf('{')+1, funcStr.lastIndexOf('}'));
            this.scriptFile = undefined;
        } else {
            this.scriptArgs = undefined;
            this.scriptBody = undefined;
            this.scriptFile = script;
        }
    };
    
    Job.prototype = {
        getParameter : function () {
            return this.param;
        },
        setParameter : function (param) {
            this.param = param;
        },
        
        getImportScripts : function () {
            return this.importScripts;
        },
        setImportScripts : function (scripts) {
            this.importScripts = scripts;
        },
        
        /**
         *  @return Object: { args: ["argument name", ...], body: "<code>" }
         *          Usage:  var f = Function.apply(null, args.concat(body));
         *                  (`Function.apply()` replaces `new Function()`)
         */
        getFunction : function () {
            if(!this.scriptArgs) {
                return undefined;
            }
            
            return {
                args : this.scriptArgs,
                body : this.scriptBody
            };
        },
        getScriptFile : function () {
            return this.scriptFile;
        },
        
        /// @return True if `otherJob` uses the same function / same script as this job.
        functionallyEquals : function (otherJob) {
            return otherJob && (otherJob instanceof Job)
                && arrayEquals(otherJob.scriptArgs, this.scriptArgs)
                && otherJob.body == this.body
                && otherJob.scriptFile == this.scriptFile;
        },
        
        triggerDone : function (result) {
            _callListeners(this.callbacksDone, [result]);
        },
        triggerError : function (error) {
            _callListeners(this.callbacksError, [error]);
        },
        
        
        /**
         *  Adds a callback function that is called when the job has been (successfully) finished.
         *  @param {callback}
         *      function(result). `result` is the result value/object returned by the thread.
         */
        done : function (callback) {
            _addListener(this.callbacksDone, callback);
            return this;
        },
        
        /**
         *  Adds a callback function that is called if the job fails.
         *  @param {callback}
         *      function(error). `error` is an instance of `Error`.
         */
        error : function (callback) {
            _addListener(this.callbacksError, callback);
            return this;
        }
    };
    
    
    var Thread = function (threadPool) {
        this.threadPool = threadPool;
        this.worker     = undefined;
        this.currentJob = undefined;
        this.lastJob    = undefined;
    };
    
    Thread.prototype = {
        run : function (job) {
            var _this = this,
                needToInitWorker = true;
            this.currentJob = job;
            
            if(this.worker) {
                if(this.lastJob && this.lastJob.functionallyEquals(job)) {
                    needToInitWorker = false;
                } else {
                    this.worker.terminate();
                    this.worker = undefined;
                }
            }
            
            if(job.getScriptFile()) {
                if(needToInitWorker) {
                    this.worker = new Worker(job.getScriptFile());
                    this.worker.addEventListener('message', success, false);
                    this.worker.addEventListener('error', error, false);
                }
                this.worker.postMessage(job.getParameter());
            } else {
                if(needToInitWorker) {
                    this.worker = new Worker(genericWorkerDataUri);
                    this.worker.addEventListener('message', success, false);
                    this.worker.addEventListener('error', error, false);
                }
                this.worker.postMessage({
                    "function" :      job.getFunction(),
                    "importScripts" : job.getImportScripts(),
                    "parameter" :     job.getParameter()
                });
            }
            
            function success (event) {
                _this.currentJob.triggerDone(event.data);
                _this.threadPool.triggerDone(event.data);
                complete();
            }
            
            function error (errorEvent) {
                _this.currentJob.triggerError(errorEvent);
                _this.threadPool.triggerError(errorEvent);
                complete();
            }
            
            function complete () {
                _this.currentJob = undefined;
                _this.lastJob    = job;
                _this.threadPool._threadDone(_this);
            }
        }
    };
    
    
    /**
     *  @param {size}   Optional. Number of threads. Default is `ThreadPool.defaultSize`.
     */
    var ThreadPool = function (size) {
        size = size || ThreadPool.defaultSize;
        
        this.size = size;
        this.pendingJobs = [];
        this.idleThreads = [];
        
        this.callbacksDone = [];
        this.callbacksError = [];
        
        for(var i=0; i<size; i++) {
            this.idleThreads.push( new Thread(this) );
        }
    };
    
    ThreadPool.prototype = {
        /**
         *  Usage: run (String:WorkerScript [, Object/Scalar:Parameter] [, Function:doneCallback(returnValue)])
         *         - or -
         *         run ([Array:ImportScripts, ] Function:WorkerFunction(param, doneCB) [, Object/Scalar:Parameter] [, Function:DoneCallback(result)])
         */
        run : function () {
            ////////////////////
            // Parse arguments:
            
            var args = [].slice.call(arguments);    // convert `arguments` to a fully functional array `args`
            var workerScript, workerFunction, importScripts, parameter, doneCb;
            
            if(arguments.length < 1) {
                throw new Error("run(): Too less parameters.");
            }
            
            if(typeof args[0] == "string") {
                // 1st usage example (see doc above)
                workerScript = args.shift();
            } else {
                // 2nd usage example (see doc above)
                if(typeof args[0] == "object" && args[0] instanceof Array) {
                    importScripts = args.shift();
                }
                if(args.length > 0 && typeof args[0] == "function") {
                    workerFunction = args.shift();
                } else {
                    throw new Error("run(): Missing obligatory thread logic function.");
                }
            }
            
            if(args.length > 0 && typeof args[0] != "function") {
                parameter = args.shift();
            }
            if(args.length > 0 && typeof args[0] == "function") {
                doneCb = args.shift();
            }
            if(args.length > 0) {
                throw new Error("run(): Unrecognized parameters: "+args);
            }
            
            ///////////////
            // Create job:
            
            var job;
            if(workerScript) {
                job = new Job(workerScript, parameter);
            } else {
                job = new Job(workerFunction, parameter);
                if(importScripts && importScripts.length > 0) {
                    job.setImportScripts(importScripts);
                }
            }
            
            if(doneCb) {
                job.done(doneCb);
            }
            
            ////////////
            // Run job:
            
            this.pendingJobs.push(job);
            this.runJobs();
            
            return job;
        },
        
        runJobs : function () {
            if(this.idleThreads.length > 0 && this.pendingJobs.length > 0) {
                var thread = this.idleThreads.shift();
                var job = this.pendingJobs.shift();
                thread.run(job);
            }
        },
        
        _threadDone : function (thread) {
            this.idleThreads.push(thread);
            this.runJobs();
        },
        
        triggerDone : function (result) {
            _callListeners(this.callbacksDone, [result]);
        },
        triggerError : function (error) {
            _callListeners(this.callbacksError, [error]);
        },
        
        
        /// @see Job.done()
        done : function(callback) {
            _addListener(this.callbacksDone, callback);
            return this;
        },
        /// @see Job.error()
        error : function(callback) {
            _addListener(this.callbacksError, callback);
            return this;
        }
    };
    
    
    ////////////////////
    // Tool functions:
    
    function arrayEquals (a, b) {
        return !(a<b || a>b);
    }
    
    function _addListener (callbacksArray, callback) {
        if(typeof callback != "function") {
            throw new Error("Expected callback function as parameter.");
        }
        
        // Check that this callbacks has not yet been registered:
        for(var i=0; i<callbacksArray.length; i++) {
            var cb = callbacksArray[i];
            if(cb == callback) {
                return;
            }
        }
        callbacksArray.push(callback);
    }
    
    function _callListeners (callbacksArray, params) {
        for(var i=0; i<callbacksArray.length; i++) {
            var cb = callbacksArray[i];
            cb.apply(null, params);
        }
    }
    
    
    //////////////////////
    // Set default values:
    
    ThreadPool.defaultSize = 8;
    
    
    if(typeof define == "function") {
        // require.js:
        define([], ThreadPool);
    } else if(typeof window == "object") {
        window.ThreadPool = ThreadPool;
    }
})();


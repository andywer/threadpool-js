#!/bin/sh

cd `dirname "$0"`
java -jar closure-compiler/compiler.jar --js ../lib/threadpool.js --js_output_file ../lib/threadpool.min.js


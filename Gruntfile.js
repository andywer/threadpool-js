'use strict';

module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    jshint: {
      plugin: ['lib/threadpool.js'],
      grunt: {
        options: {
          node: true
        },
        files: {
          src: ['Gruntfile.js']
        }
      }
    },
    uglify: {
      js: {
        files: {
          'lib/threadpool.min.js': ['lib/threadpool.js']
        }
      }
    },
    watch: {
      js: {
        files: ['lib/*.js'],
        tasks: ['uglify']
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'uglify']);

};

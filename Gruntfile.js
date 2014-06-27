'use strict';

module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    jshint: {
      plugin: ['threadpool.js'],
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
          'threadpool.min.js': ['threadpool.js']
        }
      }
    },
    watch: {
      js: {
        files: ['threadpool.js'],
        tasks: ['uglify']
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'uglify']);

};

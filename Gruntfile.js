'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

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
          'threadpool.min.js': ['threadpool.js'],
          'evalWorker.min.js': ['evalWorker.js']
        }
      }
    },
    watch: {
      js: {
        files: ['threadpool.js'],
        tasks: ['uglify', 'deploy']
      }
    },

    // github pages deployment:
    copy: {
      public: {
        files: [
          { expand: true, src: ['threadpool.min.js', 'samples/**'], dest: 'public/' }
        ]
      }
    },
    'gh-pages': {
      options: {
        base: 'public'
      },
      src: ['**']
    },

    clean: ['.grunt/', 'public/']
  });

  grunt.registerTask('default', ['jshint', 'uglify']);

  grunt.registerTask('deploy', ['uglify', 'copy:public', 'gh-pages']);

};

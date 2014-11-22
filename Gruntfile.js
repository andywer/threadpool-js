'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    jshint: {
      plugin: ['src/threadpool.js'],
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
          'dist/threadpool.min.js': ['src/threadpool.js'],
          'dist/evalWorker.min.js': ['src/evalWorker.js']
        }
      }
    },
    watch: {
      js: {
        files: ['src/*.js'],
        tasks: ['uglify', 'deploy']
      }
    },

    // github pages deployment:
    copy: {
      public: {
        files: [
          { expand: true, flatten: true, src: ['dist/*.js'], dest: 'public/' },
          { expand: true, src: ['samples/**'], dest: 'public/' }
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

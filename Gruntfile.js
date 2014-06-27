'use strict';

module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-gh-pages');

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
    }
  });

  grunt.registerTask('default', ['jshint', 'uglify']);

  grunt.registerTask('deploy', ['uglify', 'copy:public', 'gh-pages']);

};

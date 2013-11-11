module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },

    env: {
      options: {},
      dev: {
        NODE_ENV: "DEVELOPMENT"
      },
      prod: {
        NODE_ENV: "PRODUCTION"
      }
    },

    preprocess : {
      dev : {
        src : './src/index.html',
        dest : './dist/index.html'
      },

      prod : {
        src : './src/index.html',
        dest : './dist/<%= pkg.version %>/index.html'
      }
    }
  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-forge');

  grunt.loadNpmTasks('grunt-preprocess');

  grunt.loadNpmTasks('grunt-env');

  // Register task(s).
  grunt.registerTask('default', ['jshint']);

  grunt.registerTask('dev', ['jshint', 'env:dev', 'clean:dev', 'preprocess:dev']);

  grunt.registerTask('prod', ['jshint', 'env:prod', 'clean:prod', 'uglify:prod', 'cssmin:prod', 'copy:prod', 'preprocess:prod']);

};
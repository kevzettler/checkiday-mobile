module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    trigger_config: grunt.file.readJSON('local_config.json'),

    trigger_creds: grunt.file.readJSON('trigger_creds.json'),

    clean: {
      main:{
        src: "dist"
      }
    },

    copy:{
      main:{
        expand: true,
        cwd: 'app/',
        src: ['**'],
        dest: 'dist/'
      },
      config:{
        expand: true,
        cwd: './',
        src: ['config.json'],
        dest: 'dist/'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      my_target: {
        files:{
        'dist/js/main.min.js' :[
           "app/js/vendor/zepto.js",
           "app/js/vendor/zepto.zelector.js",
           "app/js/vendor/zepto.fn.slide.js",
           "app/js/vendor/foundation.min.js",
           "app/js/hardcache.js",
           "app/js/vendor/jquery.calendario.js",
           "app/js/main.js"
        ]}
      }
    },

    cssmin:{
      combine:{
        files:{
          'dist/css/main.min.css': [
            "app/css/normalize.css",
            "app/css/foundation.min.css",
            "app/css/main.css",
            "app/css/calendar.css",
            "app/css/font-awesome.min.css"
          ]
        }
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
        src : 'app/index.html',
        dest : 'dist/index.html'
      },

      prod : {
        src : 'app/index.html',
        dest : 'dist/index.html'
      }
    },

    forge: {
      ios_build: {
        args: ['build', 'ios'],
        options: {
          username: '<%= trigger_creds.username %>',
          password: '<%= trigger_creds.password %>'
        }
      },
      ios_sim: { args: ['run', 'ios', '--ios.device', 'simulator'] },
      ios_device: { args: ['run', 'ios', '--ios.device', 'device'] },
      ios_package: { args: ['package', 'ios'] }
    }

  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-forge');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Register task(s).
  grunt.registerTask('default', ['dev','sim']);

  grunt.registerTask('prepare', ['clean', 'copy', 'copy:config', 'cssmin', 'uglify']);
  grunt.registerTask('dev', ['env:dev', 'prepare', 'preprocess:dev']);
  grunt.registerTask('prod', ['env:prod', 'prepare', 'preprocess:prod']);

  grunt.registerTask("build", ['forge:ios_build']);
  grunt.registerTask("sim", ['build', 'forge:ios_sim']);
  grunt.registerTask("device", ['build', 'forge:ios_device']);
  grunt.registerTask("package", ['build', 'forge:ios_package']);

  grunt.registerTask("dev:build:sim", ['dev','sim']);
  grunt.registerTask('dev:build:device', ['dev', 'device']);

  grunt.registerTask("prod:build:sim", ['prod','sim']);
  grunt.registerTask('prod:build:device', ['prod', 'device']);

};
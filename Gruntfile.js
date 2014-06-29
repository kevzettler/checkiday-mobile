module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      main:{
        src: ["www/*"]
      }
    },

    copy:{
      main:{
        expand: true,
        cwd: 'app/',
        src: ['**'],
        dest: 'www/'
      },
      config:{
        expand: true,
        cwd: './',
        src: ['config.json'],
        dest: 'www/'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      my_target: {
        files:{
        'www/js/main.min.js' :[
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
          'www/css/main.min.css': [
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
        dest : 'www/index.html'
      },

      prod : {
        src : 'app/index.html',
        dest : 'www/index.html'
      }
    },

    cordovacli: {
        options: {
            path: 'www/'
        },
        cordova: {
            options: {
                command: ['create','platform','plugin','build'],
                platforms: ['ios','android'],
                plugins: ['device','dialogs'],
                path: 'myHybridAppFolder',
                id: 'io.cordova.hellocordova',
                name: 'HelloCordova'
            }
        },
        create: {
            options: {
                command: 'create',
                id: 'com.checkiday',
                name: 'checkiday-mobile'
            }
        },

        add_platforms: {
            options: {
                command: 'platform',
                action: 'add',
                platforms: ['ios', 'android']
            }
        },

        add_plugins: {
            options: {
                command: 'plugin',
                action: 'add',
                plugins: [
                    'battery-status',
                    'camera',
                    'console',
                    'contacts',
                    'device',
                    'device-motion',
                    'device-orientation',
                    'dialogs',
                    'file',
                    'geolocation',
                    'globalization',
                    'inappbrowser',
                    'media',
                    'media-capture',
                    'network-information',
                    'splashscreen',
                    'vibration'
                ]
            }
        },

        build_ios: {
            options: {
                command: 'build',
                platforms: ['ios']
            }
        },

        emulate_ios:{
          options:{
            command: 'emulate',
            platforms: ['ios']
          }
        },

        build_android: {
            options: {
                command: 'build',
                platforms: ['android']
            }
        },
        
        emulate_android: {
            options: {
                command: 'emulate',
                platforms: ['android'],
                args: ['--target','Nexus5']
            }
        }
    }

  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-cordovacli');

  // Register task(s).
  grunt.registerTask('default', ['dev','sim']);

  grunt.registerTask('prepare', ['clean', 'copy', 'copy:config', 'cssmin', 'uglify']);
  grunt.registerTask('dev', ['env:dev', 'prepare', 'preprocess:dev']);
  grunt.registerTask('prod', ['env:prod', 'prepare', 'preprocess:prod']);

};
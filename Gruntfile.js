module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({

        //basic setting and info about plugins
        pkg: grunt.file.readJSON('package.json'),

        // Setting folder templates.
        // dirs: {
        //     normalCss: 'css/', //<%= dirs.cssNormal %>
        //     minimalCss: 'css-minimal/', //<%= dirs.cssMinimal %>
        //     sass: 'scss/' //<%= dirs.sass %>
        // },

        //sass
        sass: {

            nomalCSS: {
                option: {
                    style: 'expanded',
                    noCache: false,
                },
                files: {
                    'css/at-grid.css': ['scss/grid.scss']
                }
            },
            minimalCss: {
                option: {
                    style: 'expanded',
                    noCache: false,
                },
                files: {
                    
                    'css-minimal/at-grid-minimal.css': ['scss/grid-minimal.scss']
                }
            },


        },
        postcss: {
            options: {
              map: true,
              processors: [
                require('autoprefixer')({
                    overrideBrowserslist: ['last 5 versions']
                })
              ]
            },
            nomalCSS: {
                src:'css/*.css',
              
            },
            minimalCss: {
                src:'css-minimal/*.css',
              
            },
        },
        //css minify
        cssmin: {
            nomalCSS: {
                files: {
                    'css/at-grid.min.css': 'css/at-grid.css',
                    'css/at-grid-rtl.min.css': 'css/at-grid-rtl.css'
                }
            },
            minimalCss: {
                files: {
          
                    'css-minimal/at-grid-minimal.min.css': 'css-minimal/at-grid-minimal.css',
                    'css-minimal/at-grid-minimal-rtl.min.css': 'css-minimal/at-grid-minimal-rtl.css'
                }
            },


        },
        flipcss: {
            nomalCSS: {
                files: {
                    'css/at-grid-rtl.css': 'css/at-grid.css'
                }
            },
            minimalCss: {
                files: {

                    'css-minimal/at-grid-minimal-rtl.css': 'css-minimal/at-grid-minimal.css'
                }
            }
        },
        cssbeautifier : {
            files : [
                'css/at-grid.css',
                'css/at-grid-rtl.css',
                'css-minimal/at-grid-minimal.css',
                'css-minimal/at-grid-minimal-rtl.css'
            ]
        },

        //grunt watch
        watch: {

            css: {
                files: ['scss/**/*.scss'],
                tasks: [
                    'sass',
                    'cssmin',
                    'notify_hooks',
                    'postcss',
                    'cssbeautifier'
                   
                ]
            },

            options: {
                reload: true
            }

        },
        

        copy: {

            deploy: {
                src: [
                    '**',
                    '!.*',
                    '!*.md',
                    '!*.map',
                    '!.*/**',
                    '!.sass-cache',
                    '!Gruntfile.js',
                    '!package.json',
                    '!package-lock.json',
                    '!node_modules/**',
                    '!npm-debug.log',
                    '!assets/css/**',
                    '!assets/scss/**',
                    '!assets/js/*.map',
                    '!assets/library/acme-grid/*.map',
                    '!<%= dirs.js %>src/**',
                    '!<%= dirs.js %>src',
                    '!src',
                    '!*.zip',
                    '!deploy',
                    '!phpcs.xml.dist'

            
                ],
                dest: 'deploy/<%= pkg.name %>',
                expand: true,
                dot: true
            }
        },

        // This is optional!
        notify_hooks: {
            options: {
                enabled: true,
                max_jshint_notifications: 2, // maximum number of notifications from jshint output
                title: "Css Compiled", // defaults to the name in package.json, or will use project directory's name
                success: true, // whether successful grunt executions should be notified automatically
                duration: 1 // the duration of notification in seconds, for `notify-send only
            }
        },

    });

    //load plugins

    // Load NPM tasks to be used here
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-flipcss');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('@lodder/grunt-postcss');
    grunt.loadNpmTasks('grunt-cssbeautifier');

    // Register tasks
    grunt.registerTask('default', ['sass', 'postcss', 'cssbeautifier', 'cssmin', 'flipcss']);
    //grunt.registerTask('deploy', ['sass', 'flipcss', 'concat', 'uglify', 'cssmin', 'copy:deploy']);
    grunt.task.run('notify_hooks');

};
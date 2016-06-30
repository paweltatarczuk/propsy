'use strict';

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        // Watch Config
        watch: {
            files: ['views/**/*'],
            options: {
                livereload: true
            },
            scripts: {
                files: [
                    'assets/scripts/**/*.js',
                ],
            },
            css: {
                files: [
                    'assets/styles/**/*.css',
                ],
            },
            sass: {
                files: ['assets/styles/**/*.scss', 'assets/styles/**/*.sass'],
                tasks: ['sass:dev']
            },
            images: {
                files: [
                    'assets/images/**/*.{png,jpg,jpeg,webp}'
                ],
            },
            express: {
                files:  [ 'app.js', 'routes/*.js', 'models/*.js', '!**/node_modules/**', '!Gruntfile.js' ],
                tasks:  [ 'express:dev' ],
                options: {
                    nospawn: true // Without this option specified express won't be reloaded
                }
            },
        },

        // Hint Config
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'assets/scripts/**/*.js',
                '!assets/scripts/vendor/*',
                'test/spec/**/*.js'
            ]
        },

        // Sass Config
        sass: {
            options: {
                cacheLocation: '.tmp/.sass-cache'
            },
            dev: {
                options: {
                    style: 'expanded',
                    lineComments: true
                },
                files: [{
                    expand: true,
                    cwd: 'assets/styles/sass',
                    dest: 'assets/styles',
                    src: ['screen.scss'],
                    ext: '.css'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'assets/styles/sass',
                    dest: 'assets/styles',
                    src: ['screen.scss'],
                    ext: '.css'
                }]
            }
        },

        // Express Config
        express: {
            dev: {
                options: {
                    script: 'app.js'
                }
            }
        },

        // Open Config
        open: {
            site: {
                path: 'http://localhost:3000',
                app: 'chromium-browser'
            }
        },
    });

    // Register Tasks
    // Workon
    grunt.registerTask('workon', 'Start working on this project.', [
        'sass:dev',
        //'env:dev',
        'express:dev',
        //'open:site',
        'watch'
    ]);


    // Restart
    grunt.registerTask('restart', 'Restart the server.', [
        //'env:dev',
        'express:dev',
        'watch'
    ]);

    // Server
    grunt.registerTask('server', 'Start only the server.', [
        //'env:dev',
        'express:dev',
        'watch:express'
    ]);


    // Build
    grunt.registerTask('build', 'Build production ready assets and views.', [
        'jshint',
        'sass:dist',
    ]);

};

module.exports = function(grunt) {

    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        'tpl-wrap': {
            require : {
                options: {
                    template: 'src/wrappers/require.tpl'
                },
                files: [
                    {
                        src: ['src/js/calendar-web-widget.js'],
                        dest: 'dist/js/calendar-web-widget-require.js'
                    }
                ]
            },
            browserify : {
                options: {
                    template: 'src/wrappers/browserify.tpl'
                },
                files: [
                    {
                        src: ['src/js/calendar-web-widget.js'],
                        dest: 'dist/js/calendar-web-widget-browserify.js'
                    }
                ]
            }
        },

        compass: {
            default: {
                options: {
                    sassDir: 'src/scss',
                    cssDir : 'dist/css'
                }
            }
        },


        copy: {
            default : {
                files : [
                    { src: [ 'src/js/calendar-web-widget.js'], dest : 'dist/js/calendar-web-widget.js', filter: 'isFile' }
                ]
            }
        },

        cssmin: {
            default: {
                expand: true,
                cwd: 'dist/css',
                src: ['*.css', '!*.min.css'],
                dest: 'dist/css/',
                ext: '.min.css'
            }
        },

        uglify: {
            default : {
                files: [
                    { cwd: 'dist/js', src: ['*.js','!*.min.js'], dest: 'dist/js', expand: true, ext: '.min.js' }
                ]
            }
        },

        usebanner: {
            taskName: {
                options: {
                    position: 'top',
                    banner: '/* calendar-web-widget | https://github.com/shukriadams/calendar-web-widget | License : GPLv2 */',
                    linebreak: true
                },
                files: {
                    src: [ 'dist/**/*.js', 'dist/**/*.css' ]
                }
            }
        },

        clean:{
            options : { force: true },
            default : [
                "dist/**/*.js",
                "dist/**/*.css"
            ]
        }

    });

    grunt.loadNpmTasks('grunt-tpl-wrap');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-banner');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', [ 'clean', 'tpl-wrap:require', 'tpl-wrap:browserify', 'copy', 'compass', 'cssmin', 'uglify', 'usebanner' ]);
};

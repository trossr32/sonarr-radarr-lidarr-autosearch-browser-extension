/* jshint esversion: 6 */

/// <binding BeforeBuild='default' />
module.exports = function (grunt) {
    const sass = require('sass');
    
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: { 
            debug: {
                src: ["dist/*"] 
            },
            release: {
                src: ["dist/*", "Publish"]
            }
        },

        sass: {
            options: {
                implementation: sass,
                sourceMap: false, // Create source map
                outputStyle: 'expanded' // Minify output
            },
            dist: {
                files: [{
                    expand: true, // Recursive
                    cwd: "src/content/sass", // The startup directory
                    src: ["*.scss"], // Source files
                    dest: "dist/content/css", // Destination
                    ext: ".css", // File extension
                }]
            }
        },

        copy: {
            release: {
                files: [
                    // js
                    { expand: true, flatten: true, src: 'node_modules/@fortawesome/fontawesome-free/js/all.min.js', dest: 'dist/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js', dest: 'dist/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map', dest: 'dist/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap4-toggle/js/bootstrap4-toggle.min.js', dest: 'dist/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap-slider/dist/bootstrap-slider.min.js', dest: 'dist/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/jquery/dist/jquery.min.js', dest: 'dist/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js', dest: 'dist/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map', dest: 'dist/content/js', filter: 'isFile' },
                    { expand: true, flatten: false, cwd: "src", src: '**/*.js', dest: 'dist', filter: 'isFile' },

                    // css
                    { expand: true, flatten: true, src: 'node_modules/bootstrap/dist/css/bootstrap.min.css', dest: 'dist/content/css', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap/dist/css/bootstrap.min.css.map', dest: 'dist/content/css', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap4-toggle/css/bootstrap4-toggle.min.css', dest: 'dist/content/css', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap4-toggle/css/bootstrap4-toggle.min.css.map', dest: 'dist/content/css', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap-slider/dist/css/bootstrap-slider.min.css', dest: 'dist/content/css', filter: 'isFile' },
                    //{ expand: true, flatten: false, cwd: "src", src: '**/*.css', dest: 'dist', filter: 'isFile' },

                    // content
                    { expand: true, flatten: true, src: 'src/*.html', dest: 'dist', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'src/manifest.json', dest: 'dist', filter: 'isFile' },
                    
                    // images
                    { expand: true, flatten: false, cwd: "src/content/assets/images/", src: '**', dest: 'dist/content/assets/images' },
                ]
            },
            debug: {
                files: [
                    // debug
                    { expand: true, flatten: false, cwd: "src", src: '**/*.js', dest: 'dist', filter: 'isFile' },
                ]
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
              },
            all: ['Gruntfile.js', 'src/content/**/*.js'] 
        },

        watch: {
            debug: {
                files: [
                    'Gruntfile.js',
                    'src/**/*.*'
                ],
                tasks: ['release'],
                options: {
                    spawn: false,
                },
            }
        },

        shell: {
            ps: {
                options: {
                    stdout: true
                },
                command: 'powershell.exe -File CreatePackage_Grunt.ps1'
            },
            sh: {
                options: {
                    stdout: true
                },
                command: 'create-package_Grunt.sh'
            }
        }
    });

    // debug group task
    grunt.registerTask('debug', ['jshint', 'clean:debug', 'copy']);
    
    // release group task
    grunt.registerTask('release', ['jshint', 'clean:release', 'sass', 'copy:release', 'shell:ps']);
    
    // Runs the .sh package create. Possibly.
    // grunt.registerTask('release', ['jshint', 'clean:release', 'sass', 'copy:release', 'shell:sh']);
    
    // review group task
    grunt.registerTask('review', ['clean:release', 'copy:release']);
};
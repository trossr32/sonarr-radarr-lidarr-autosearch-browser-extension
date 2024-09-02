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
            chromium_dist: {
                files: [{
                    expand: true, // Recursive
                    cwd: "src/content/sass", // The startup directory
                    src: ["*.scss"], // Source files
                    dest: "dist/chromium/content/css", // Destination
                    ext: ".css", // File extension
                }]
            },
            firefox_dist: {
                files: [{
                    expand: true, // Recursive
                    cwd: "src/content/sass", // The startup directory
                    src: ["*.scss"], // Source files
                    dest: "dist/firefox/content/css", // Destination
                    ext: ".css", // File extension
                }]
            }
        },

        copy: {
            // release: {
            //     files: [
            //         // js
            //         { expand: true, flatten: true, src: 'node_modules/@fortawesome/fontawesome-free/js/all.min.js', dest: 'dist/content/js', filter: 'isFile' },
            //         { expand: true, flatten: true, src: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js', dest: 'dist/content/js', filter: 'isFile' },
            //         { expand: true, flatten: true, src: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map', dest: 'dist/content/js', filter: 'isFile' },
            //         { expand: true, flatten: true, src: 'node_modules/bootstrap4-toggle/js/bootstrap4-toggle.min.js', dest: 'dist/content/js', filter: 'isFile' },
            //         { expand: true, flatten: true, src: 'node_modules/bootstrap-slider/dist/bootstrap-slider.min.js', dest: 'dist/content/js', filter: 'isFile' },
            //         { expand: true, flatten: true, src: 'node_modules/jquery/dist/jquery.min.js', dest: 'dist/content/js', filter: 'isFile' },
            //         { expand: true, flatten: true, src: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js', dest: 'dist/content/js', filter: 'isFile' },
            //         { expand: true, flatten: true, src: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map', dest: 'dist/content/js', filter: 'isFile' },
            //         { expand: true, flatten: false, cwd: "src", src: '**/*.js', dest: 'dist', filter: 'isFile' },

            //         // css
            //         { expand: true, flatten: true, src: 'node_modules/bootstrap/dist/css/bootstrap.min.css', dest: 'dist/content/css', filter: 'isFile' },
            //         { expand: true, flatten: true, src: 'node_modules/bootstrap/dist/css/bootstrap.min.css.map', dest: 'dist/content/css', filter: 'isFile' },
            //         { expand: true, flatten: true, src: 'node_modules/bootstrap4-toggle/css/bootstrap4-toggle.min.css', dest: 'dist/content/css', filter: 'isFile' },
            //         { expand: true, flatten: true, src: 'node_modules/bootstrap4-toggle/css/bootstrap4-toggle.min.css.map', dest: 'dist/content/css', filter: 'isFile' },
            //         { expand: true, flatten: true, src: 'node_modules/bootstrap-slider/dist/css/bootstrap-slider.min.css', dest: 'dist/content/css', filter: 'isFile' },
            //         { expand: true, flatten: true, src: 'node_modules/@melloware/coloris/dist/coloris.min.css', dest: 'dist/content/css', filter: 'isFile' },
            //         //{ expand: true, flatten: false, cwd: "src", src: '**/*.css', dest: 'dist', filter: 'isFile' },

            //         // content
            //         { expand: true, flatten: true, src: 'src/*.html', dest: 'dist', filter: 'isFile' },
                    
            //         // images
            //         { expand: true, flatten: false, cwd: "src/content/assets/images/", src: '**', dest: 'dist/content/assets/images' }
            //     ]
            // },
            firefox: {
                files: [
                    // js
                    { expand: true, flatten: true, src: 'node_modules/@fortawesome/fontawesome-free/js/all.min.js', dest: 'dist/firefox/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js', dest: 'dist/firefox/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map', dest: 'dist/firefox/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap4-toggle/js/bootstrap4-toggle.min.js', dest: 'dist/firefox/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap-slider/dist/bootstrap-slider.min.js', dest: 'dist/firefox/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/jquery/dist/jquery.min.js', dest: 'dist/firefox/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js', dest: 'dist/firefox/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map', dest: 'dist/firefox/content/js', filter: 'isFile' },
                    { expand: true, flatten: false, cwd: "src", src: '**/*.js', dest: 'dist/firefox', filter: 'isFile' },

                    // css
                    { expand: true, flatten: true, src: 'node_modules/bootstrap/dist/css/bootstrap.min.css', dest: 'dist/firefox/content/css', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap/dist/css/bootstrap.min.css.map', dest: 'dist/firefox/content/css', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap4-toggle/css/bootstrap4-toggle.min.css', dest: 'dist/firefox/content/css', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap4-toggle/css/bootstrap4-toggle.min.css.map', dest: 'dist/firefox/content/css', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap-slider/dist/css/bootstrap-slider.min.css', dest: 'dist/firefox/content/css', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/@melloware/coloris/dist/coloris.min.css', dest: 'dist/firefox/content/css', filter: 'isFile' },
                    //{ expand: true, flatten: false, cwd: "src", src: '**/*.css', dest: 'dist', filter: 'isFile' },

                    // content
                    { expand: true, flatten: true, src: 'src/*.html', dest: 'dist/firefox', filter: 'isFile' },
                    
                    // images
                    { expand: true, flatten: false, cwd: "src/content/assets/images/", src: '**', dest: 'dist/firefox/content/assets/images' },

                    // manifest
                    { expand: true, flatten: true, src: 'src/manifest-firefox/manifest.json', dest: 'dist/firefox', filter: 'isFile' }
                ]
            },
            chromium: {
                files: [
                    // js
                    { expand: true, flatten: true, src: 'node_modules/@fortawesome/fontawesome-free/js/all.min.js', dest: 'dist/chromium/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js', dest: 'dist/chromium/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map', dest: 'dist/chromium/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap4-toggle/js/bootstrap4-toggle.min.js', dest: 'dist/chromium/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap-slider/dist/bootstrap-slider.min.js', dest: 'dist/chromium/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/jquery/dist/jquery.min.js', dest: 'dist/chromium/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js', dest: 'dist/chromium/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map', dest: 'dist/chromium/content/js', filter: 'isFile' },
                    { expand: true, flatten: false, cwd: "src", src: '**/*.js', dest: 'dist/chromium', filter: 'isFile' },

                    // css
                    { expand: true, flatten: true, src: 'node_modules/bootstrap/dist/css/bootstrap.min.css', dest: 'dist/chromium/content/css', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap/dist/css/bootstrap.min.css.map', dest: 'dist/chromium/content/css', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap4-toggle/css/bootstrap4-toggle.min.css', dest: 'dist/chromium/content/css', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap4-toggle/css/bootstrap4-toggle.min.css.map', dest: 'dist/chromium/content/css', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/bootstrap-slider/dist/css/bootstrap-slider.min.css', dest: 'dist/chromium/content/css', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/@melloware/coloris/dist/coloris.min.css', dest: 'dist/chromium/content/css', filter: 'isFile' },
                    //{ expand: true, flatten: false, cwd: "src", src: '**/*.css', dest: 'dist', filter: 'isFile' },

                    // content
                    { expand: true, flatten: true, src: 'src/*.html', dest: 'dist/chromium', filter: 'isFile' },
                    
                    // images
                    { expand: true, flatten: false, cwd: "src/content/assets/images/", src: '**', dest: 'dist/chromium/content/assets/images' },

                    // manifest
                    { expand: true, flatten: true, src: 'src/manifest-chromium/manifest.json', dest: 'dist/chromium', filter: 'isFile' }
                ]
            },
            debug: {
                files: [
                    // debug
                    { expand: true, flatten: false, cwd: "src", src: '**/*.js', dest: 'dist/chromium', filter: 'isFile' },
                    { expand: true, flatten: false, cwd: "src", src: '**/*.js', dest: 'dist/firefox', filter: 'isFile' }
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
                command: './create_package_Grunt.sh'
            }
        }
    });

    // debug group task
    grunt.registerTask('debug', ['jshint', 'clean:debug', 'sass', 'copy']);
    grunt.registerTask('playwright', ['clean:debug', 'sass', 'copy:firefox', 'copy:chromium']);
    
    if (process.platform === "win32") {
        // release group task
        grunt.registerTask('release', ['jshint', 'clean:release', 'sass', 'copy:firefox', 'copy:chromium', 'shell:ps']);
    } else {
        // Runs the .sh package create. Possibly.
        grunt.registerTask('release', ['jshint', 'clean:release', 'sass', 'copy:firefox', 'copy:chromium', 'shell:sh']);
    }
    
    // review group task
    grunt.registerTask('review', ['clean:release', 'copy:release']);
};
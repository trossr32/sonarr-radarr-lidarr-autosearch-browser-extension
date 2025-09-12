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

        copy: {
            firefox: {
                files: [
                    // js
                    { expand: true, flatten: true, src: 'node_modules/@fortawesome/fontawesome-free/js/fontawesome.min.js', dest: 'dist/firefox/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/@fortawesome/fontawesome-free/js/solid.min.js', dest: 'dist/firefox/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/@fortawesome/fontawesome-free/js/brands.min.js', dest: 'dist/firefox/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/jquery/dist/jquery.min.js', dest: 'dist/firefox/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js', dest: 'dist/firefox/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map', dest: 'dist/firefox/content/js', filter: 'isFile' },
                    { expand: true, flatten: false, cwd: "src", src: '**/*.js', dest: 'dist/firefox', filter: 'isFile' },

                    // css
                    { expand: true, flatten: true, src: 'node_modules/@melloware/coloris/dist/coloris.min.css', dest: 'dist/firefox/content/css', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'src/content/css/options.css', dest: 'dist/firefox/content/css', filter: 'isFile' },
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
                    { expand: true, flatten: true, src: 'node_modules/@fortawesome/fontawesome-free/js/fontawesome.min.js', dest: 'dist/chromium/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/@fortawesome/fontawesome-free/js/solid.min.js', dest: 'dist/chromium/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/@fortawesome/fontawesome-free/js/brands.min.js', dest: 'dist/chromium/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/jquery/dist/jquery.min.js', dest: 'dist/chromium/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js', dest: 'dist/chromium/content/js', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map', dest: 'dist/chromium/content/js', filter: 'isFile' },
                    { expand: true, flatten: false, cwd: "src", src: '**/*.js', dest: 'dist/chromium', filter: 'isFile' },

                    // css
                    { expand: true, flatten: true, src: 'node_modules/@melloware/coloris/dist/coloris.min.css', dest: 'dist/chromium/content/css', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'src/content/css/options.css', dest: 'dist/chromium/content/css', filter: 'isFile' },
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
            },
            // Tailwind build for both browsers (uses tailwind.config.js at project root)
            tailwind_firefox: {
                command: 'npx tailwindcss -i ./src/content/css/tailwind.css -c ./tailwind.config.js -o ./dist/firefox/content/css/tailwind.css --minify'
            },
            tailwind_chromium: {
                command: 'npx tailwindcss -i ./src/content/css/tailwind.css -c ./tailwind.config.js -o ./dist/chromium/content/css/tailwind.css --minify'
            }
        }
    });

    // debug group task
    grunt.registerTask('debug', ['jshint', 'clean:debug', 'copy', 'shell:tailwind_firefox', 'shell:tailwind_chromium']);
    grunt.registerTask('playwright', ['clean:debug', 'copy:firefox', 'copy:chromium', 'shell:tailwind_firefox', 'shell:tailwind_chromium']);
    
    if (process.platform === "win32") {
        // release group task
        grunt.registerTask('release', ['jshint', 'clean:release', 'copy:firefox', 'copy:chromium', 'shell:tailwind_firefox', 'shell:tailwind_chromium', 'shell:ps']);
    } else {
        // Runs the .sh package create. Possibly.
        grunt.registerTask('release', ['jshint', 'clean:release', 'copy:firefox', 'copy:chromium', 'shell:tailwind_firefox', 'shell:tailwind_chromium', 'shell:sh']);
    }
    
    // review group task
    grunt.registerTask('review', ['clean:release', 'copy:release']);
};
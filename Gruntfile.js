/* eslint-env node */
module.exports = function Gruntfile( grunt ) {
	var pkg = grunt.file.readJSON( 'package.json' );

	grunt.loadNpmTasks( 'grunt-browserify' );
	grunt.loadNpmTasks( 'grunt-run' );
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-concat-with-template' );
	grunt.loadNpmTasks( 'grunt-contrib-less' );
	grunt.loadNpmTasks( 'grunt-stylelint' );
	grunt.loadNpmTasks( 'grunt-jsdoc' );

	grunt.initConfig( {
		pkg: pkg,
		eslint: {
			code: {
				src: [
					'**/*.js',
					'!build/**',
					'!extension/**',
					'!docs/**',
					'!node_modules/**',
					'!temp/**',
					'!test/**',
					'test/suite/**',
					'extension/js/contentScript.js'
				]
			}
		},
		stylelint: {
			code: {
				src: [
					'src/less/*.less'
				]
			}
		},
		jsdoc: {
			all: {
				options: {
					configure: '.jsdoc.json'
				}
			}
		},
		less: {
			browserextension: {
				options: {
					banner: grunt.file.read( 'build/header.browserextension.txt' )
				},
				files: {
					'extension/generated.whowrotethat.css': 'src/less/index.less'
				}
			}
		},
		concat: {
			browserextension: {
				options: {
					banner: grunt.file.read( 'build/header.browserextension.txt' ),
					// Remove wrapping IIFE ( function () {}() );\n
					process: function ( src, filepath ) {
						// Only remove the end if we're removing the starting
						// (function () { ... wrapper
						if ( new RegExp( /^\( function \(\) {/ ).test( src ) ) {
							src = src
								.replace( /^\( function \(\) {/, '' ) // Beginning of file
								.replace( /}\(\) \);\n$/, '' );
						}
						// eslint-disable-next-line quotes
						return '/* >> Starting source: ' + filepath + " << */\n" +
							src +
							'/* >> End source: ' + filepath + ' << */';
					}
				},
				files: {
					'temp/fullScript.js': [
						// The actual behavior script
						// Files should be in order
						'src/globals.js',
						'src/Api.js',
						'src/test.js'
					]
				}
			}
		},
		// eslint-disable-next-line camelcase
		concat_with_template: {
			// If we ever want to include a pure es6 file without babelifying
			browserextensiones6: {
				src: {
					fullScript: 'temp/fullScript.js'
				},
				dest: 'extension/js/generated.pageScript.js',
				tmpl: 'build/template_browserextension.js'
			},
			browserextensionBabelified: {
				src: {
					fullScript: 'temp/fullScript.babelified.js'
				},
				dest: 'extension/js/generated.pageScript.js',
				tmpl: 'build/template_browserextension.js'
			}
		},
		browserify: {
			browserextension: {
				options: {
					transform: [
						[ 'babelify' ]
					]
				},
				src: [ 'src/app.js' ],
				dest: 'temp/fullScript.babelified.js'
			}
		},
		run: {
			options: {},
			tests: {
				cmd: 'npm',
				args: [
					'run',
					'mocha'
				]
			}
		}
	} );

	grunt.registerTask( 'lint', [ 'eslint' ] );
	grunt.registerTask( 'test', [ 'lint', 'run:tests' ] );
	grunt.registerTask( 'build', [ 'less:browserextension', 'browserify:browserextension', 'concat_with_template:browserextensionBabelified' ] );
	grunt.registerTask( 'default', [ 'test', 'build' ] );
};

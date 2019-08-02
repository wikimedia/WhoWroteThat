/* eslint-env node */
module.exports = function Gruntfile( grunt ) {
	var pkg = grunt.file.readJSON( 'package.json' );

	grunt.loadNpmTasks( 'grunt-contrib-watch' );
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
		qunit: {
			all: [ 'test/index.html' ]
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
						// Only remove the end if we're removing the starting (function () { ... wrapper
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
			browserextension: {
				src: {
					fullScript: 'temp/fullScript.js'
				},
				dest: 'extension/js/generated.pageScript.js',
				tmpl: 'build/template_browserextension.js'
			}
		}
	} );

	grunt.registerTask( 'lint', [ 'eslint', 'stylelint' ] );
	grunt.registerTask( 'test', [ 'lint', 'qunit' ] );
	grunt.registerTask( 'build', [ 'less:browserextension', 'concat:browserextension', 'concat_with_template:browserextension' ] );
	grunt.registerTask( 'default', [ 'test', 'build' ] );
};

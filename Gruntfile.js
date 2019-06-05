/* eslint-env node */
module.exports = function Gruntfile( grunt ) {
	var pkg = grunt.file.readJSON( 'package.json' );

	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );

	grunt.initConfig( {
		pkg: pkg,
		eslint: {
			code: {
				src: [
					'src/*.js',
					'src/**/*.js',
					'!extension/**',
					'!node_modules/**'
				]
			}
		},
		qunit: {
			all: [ 'tests/index.html' ]
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
					'extension/js/content.js': [
						'src/globals.js',
						'src/Api.js'
					]
				}
			}
		}
	} );

	grunt.registerTask( 'lint', [ 'eslint' ] );
	grunt.registerTask( 'test', [ 'lint', 'qunit' ] )
	grunt.registerTask( 'build', [ 'test', 'concat:browserextension' ] );
	grunt.registerTask( 'default', 'test' );
};

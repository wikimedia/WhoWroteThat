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
		// qunit: {
		// 	all: [ 'tests/index.html' ]
		// },
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
					'dist/wikiArticleWizard.userscript.js': [
						'src/init.waw.js',
						'src/waw.Config.js',
						'src/init.loader.start.js', // start mw.loader.using
						'src/waw.Utils.js',
						'src/waw.ui.DialogPageLayout.js',
						'src/waw.ui.ArticleItemWidget.js',
						'src/waw.ui.ArticleSectionWidget.js',
						'src/waw.ui.WizardDialog.js',
						'src/waw.init.DOM.js',
						'src/init.loader.end.js', // end mw.loader.using
						'src/init.language.js'
					]
				}
			}
		}
	} );

	grunt.registerTask( 'lint', [ 'eslint' ] );
	grunt.registerTask( 'build', [ 'lint', 'concat:browserextension' ] );
	grunt.registerTask( 'default', 'test' );
};

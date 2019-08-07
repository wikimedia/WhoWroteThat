/* eslint-env node */
module.exports = function Gruntfile( grunt ) {
	var pkg = grunt.file.readJSON( 'package.json' ),
		generatedFile = 'temp/generated.fullScript.babelified.js',
		// Get all language files
		langFiles = grunt.file
			.expand( { filter: 'isFile', cwd: 'i18n' }, [ '*' ] )
			.filter( function ( f ) { return f !== 'qqq.json'; } ),
		/**
		 * Generate a language JSON blob from the i18n translation files
		 *
		 * @return {Object} JSON object of all translations, keyed by language code
		 */
		generateLangBlob = function () {
			var langBlob = {};

			langFiles.forEach( function ( filename ) {
				var lang = filename.substring( 0, filename.indexOf( '.json' ) ),
					json = grunt.file.readJSON( 'i18n/' + filename );

				delete json[ '@metadata' ];

				// Store in language blob
				langBlob[ lang ] = json;
			} );

			return langBlob;
		};

	grunt.loadNpmTasks( 'grunt-browserify' );
	grunt.loadNpmTasks( 'grunt-run' );
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-replace' );
	grunt.loadNpmTasks( 'grunt-contrib-less' );
	grunt.loadNpmTasks( 'grunt-stylelint' );
	grunt.loadNpmTasks( 'grunt-jsdoc' );
	grunt.loadNpmTasks( 'grunt-banana-checker' );

	grunt.initConfig( {
		pkg: pkg,
		eslint: {
			code: {
				src: [
					'**/*.js',
					'!build/**',
					'!docs/**',
					'!dist/**',
					'!node_modules/**',
					'!temp/**',
					'!test/**',
					'test/suite/**',
					'dist/extension/js/contentScript.js'
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
		banana: {
			all: 'i18n/'
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
					'dist/extension/generated.whowrotethat.css': 'src/less/index.less'
				}
			},
			gadget: {
				options: {
					banner: grunt.file.read( 'build/header.gadget.txt' )
				},
				files: {
					'dist/gadget/generated.whowrotethat.css': 'src/less/index.less'
				}
			}
		},
		browserify: {
			fullScript: {
				src: 'src/app.js',
				dest: 'temp/generated.fullScript.babelified.js',
				options: {
					transform: [ 'babelify' ]
				}
			}
		},
		replace: {
			browserextension: {
				options: {
					patterns: []
				},
				files: [
					{
						src: 'build/template_browserextension.js',
						dest: 'dist/extension/js/generated.pageScript.js'
					}
				]
			},
			gadget: {
				options: {
					patterns: []
				},
				files: [
					{
						src: 'build/template_gadget.js',
						dest: 'dist/gadget/generated.pageScript.js'
					}
				]
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

	/**
	 * This task is made for the purpose of making sure we generate the file
	 * (with browserify) first, and only afterwards we run the `replace` task.
	 *
	 * If we try to tell `replace` to read the temporary file, it will fail
	 * because that will be done before the file is ready. Instead, we define
	 * the replace task without replacement values, and only add those values
	 * when we're sure that the file is ready to be read.
	 *
	 * @param [string] which Which task we output; 'browserextension'
	 *  TODO: Add 'gadget' specifier later.
	 */
	grunt.registerTask( 'generateProductionScript', function () {
		var done = this.async();

		// Run `browserify`
		grunt.util.spawn(
			{
				grunt: true,
				args: [ 'browserify:fullScript' ]
			},
			// Callback when that's done
			function () {
				[ 'browserextension', 'gadget' ].forEach( ( which ) => {
					// Update the config to reflect the file we created
					grunt.config(
						'replace.' + which + '.options.patterns',
						[
							{
								match: 'jqueryInitialization',
								replacement: grunt.file.read( 'src/singleton.activation.js' )
							},
							{
								match: 'fullScript',
								replacement: grunt.file.read( generatedFile )
							},
							{
								match: 'languageBlob',
								replacement: generateLangBlob()
							}
						]
					);
				} );

				// Run the `replace` task
				grunt.task.run( [ 'replace:browserextension', 'replace:gadget' ] );
				// Done async
				done();
			}
		);
	} );

	grunt.registerTask( 'lint', [ 'eslint', 'banana' ] );
	grunt.registerTask( 'test', [ 'lint', 'run:tests' ] );
	grunt.registerTask( 'build', [ 'less', 'generateProductionScript' ] );
	grunt.registerTask( 'default', [ 'test', 'build' ] );
};

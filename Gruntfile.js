/* eslint-env node */
module.exports = function Gruntfile( grunt ) {
	const pkg = grunt.file.readJSON( 'package.json' ),
		// Get all language files
		langFiles = grunt.file
			.expand( { filter: 'isFile', cwd: 'i18n' }, [ '*' ] )
			.filter( f => f !== 'qqq.json' ),
		/**
		 * Generate a language JSON blob from the i18n translation files
		 *
		 * @return {Object} JSON object of all translations, keyed by language code
		 */
		generateLangBlob = () => {
			const langBlob = {};

			langFiles.forEach( function ( filename ) {
				const lang = filename.substring( 0, filename.indexOf( '.json' ) ),
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
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-replace' );
	grunt.loadNpmTasks( 'grunt-contrib-less' );
	grunt.loadNpmTasks( 'grunt-stylelint' );
	grunt.loadNpmTasks( 'grunt-jsdoc' );
	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );

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
					'build/extension_content_script.js'
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
					configure: '.jsdoc.json',
					pedantic: true
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
			gadget: {
				src: 'src/outputs/gadget.js',
				dest: 'dist/gadget/generated.whowrotethat.js',
				options: {
					transform: [ 'babelify' ]
				}
			},
			browserextension: {
				src: 'src/outputs/browserextension.js',
				dest: 'dist/extension/js/generated.pageScript.js',
				options: {
					transform: [ 'babelify' ]
				}
			},
			browserextensionTour: {
				src: 'src/outputs/browserextension_tour.js',
				dest: 'dist/extension/js/generated.welcomeTour.js',
				options: {
					transform: [ 'babelify' ]
				}
			}
		},
		replace: {
			language: {
				options: {
					patterns: [
						{
							match: 'languageBlob',
							replacement: generateLangBlob()
						}
					]
				},
				files: [
					{
						src: 'build/template_language.js',
						dest: 'temp/languages.js'
					}
				]
			}
		},
		copy: {
			browserextension: {
				files: [
					{ src: 'build/extension_manifest.json', dest: 'dist/extension/manifest.json' },
					{ src: 'build/extension_content_script.js', dest: 'dist/extension/js/contentScript.js' },
					{ src: 'build/logo/icon-48.png', dest: 'dist/extension/icons/icon-48.png' },
					{ src: 'build/logo/icon-128.png', dest: 'dist/extension/icons/icon-128.png' },
					{ src: 'build/logo/icon-128@2x.png', dest: 'dist/extension/icons/icon-128@2x.png' }
				]
			}
		},
		clean: [ 'dist/', 'temp/' ],
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

	grunt.registerTask( 'lint', [ 'eslint', 'stylelint', 'banana', 'jsdoc' ] );
	grunt.registerTask( 'test', [ 'lint', 'run:tests' ] );
	grunt.registerTask( 'build', [ 'clean', 'less', 'replace:language', 'browserify', 'copy' ] );
	grunt.registerTask( 'default', [ 'test', 'build' ] );
};

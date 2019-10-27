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
	grunt.loadNpmTasks( 'grunt-shell' );
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-contrib-compress' );
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
					transform: [ 'babelify' ],
					exclude: [ 'jquery' ]
				}
			},
			browserextension: {
				src: 'src/outputs/browserextension.js',
				dest: 'dist/extension/js/generated.pageScript.js',
				options: {
					transform: [ 'babelify' ],
					exclude: [ 'jquery' ]
				}
			},
			browserextensionTour: {
				src: 'src/outputs/browserextension_tour.js',
				dest: 'dist/extension/js/generated.welcomeTour.js',
				options: {
					transform: [ 'babelify' ],
					exclude: [ 'jquery' ]
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
			},
			manifest: {
				options: {
					patterns: [
						{ match: 'version', replacement: pkg.version + '.0' }
					]
				},
				files: [
					{
						src: 'build/extension_manifest.json',
						dest: 'dist/extension/manifest.json'
					}
				]
			}
		},
		copy: {
			browserextension: {
				files: [
					{ src: 'build/extension_content_script.js', dest: 'dist/extension/js/contentScript.js' },
					{ src: 'build/logo/icon-48.png', dest: 'dist/extension/icons/icon-48.png' },
					{ src: 'build/logo/icon-128.png', dest: 'dist/extension/icons/icon-128.png' },
					{ src: 'build/logo/icon-128@2x.png', dest: 'dist/extension/icons/icon-128@2x.png' }
				]
			}
		},
		clean: [ 'dist/', 'temp/' ],
		shell: {
			mocha: 'mocha --require @babel/register test/testHelper.js --recursive test/suite  --colors',
			webextBuild: 'web-ext build',
			webextLint: 'web-ext lint',
			webextRun: 'web-ext run --start-url https://en.wikipedia.org/wiki/Special:Random --no-reload'
		},
		compress: {
			webextSource: {
				options: {
					archive: './dist/whowrotethat_for_wikipedia-' + pkg.version + '.0_source.zip',
					mode: 'zip'
				},
				files: [
					{ src: [
						'{build,i18n,src,test,tutorials}/**',
						'*.js*', '.*.js*', '*.md', '.{babelrc,eslintrc,nvmrc}'
					] }
				]
			}
		}
	} );

	grunt.registerTask( 'extLocales', () => {
		const langBlob = generateLangBlob(),
			qqq = grunt.file.readJSON( 'i18n/qqq.json' );
		Object.keys( langBlob ).forEach( function ( lang ) {
			const locale = {};
			if ( langBlob[ lang ][ 'whowrotethat-ext-name' ] ) {
				locale.name = {
					message: langBlob[ lang ][ 'whowrotethat-ext-name' ],
					description: qqq[ 'whowrotethat-ext-name' ]
				};
			}
			if ( langBlob[ lang ][ 'whowrotethat-ext-desc' ] ) {
				locale.description = {
					message: langBlob[ lang ][ 'whowrotethat-ext-desc' ],
					description: qqq[ 'whowrotethat-ext-desc' ]
				};
			}
			if ( locale.name || locale.description ) {
				const localeFile = 'dist/extension/_locales/' + lang + '/messages.json';
				grunt.log.ok( 'Writing ' + localeFile );
				grunt.file.write( localeFile, JSON.stringify( locale, null, 4 ) );
			}
		} );
	} );

	grunt.registerTask( 'lint', [ 'eslint', 'stylelint', 'banana', 'jsdoc' ] );
	grunt.registerTask( 'test', [ 'lint', 'shell:mocha' ] );
	grunt.registerTask( 'build', [ 'clean', 'less', 'replace', 'browserify', 'copy', 'extLocales', 'shell:webextLint' ] );
	grunt.registerTask( 'run', [ 'build', 'shell:webextRun' ] );
	grunt.registerTask( 'default', [ 'test', 'build', 'shell:webextBuild', 'compress:webextSource' ] );
};

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
			}
		},
		browserify: {
			browserextension: {
				src: 'src/outputs/browserextension.js',
				dest: 'dist/extension/js/generated.pageScript.js',
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
						// The trailing '0' here is also used in the compress.webextSource Grunt
						// task below.
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
			// Build two extension zip files for uploading to the browser stores.
			// Note that the manifest.json in the Chrome zip file is actually from
			// manifest_chrome.json in the dist directory.
			webextBuild: [
				// Build for Firefox.
				'web-ext build --artifacts-dir dist/extension_firefox',
				// Swap manifests, and build for Chrome. The manifest_chrome.json has already been
				// built by the time this task runs (see the 'chromeManifest' task).
				'mv dist/extension/manifest.json dist/extension/manifest_firefox.json',
				'mv dist/extension/manifest_chrome.json dist/extension/manifest.json',
				'web-ext build --artifacts-dir dist/extension_chrome',
				// Swap manifests back to their original state.
				'mv dist/extension/manifest.json dist/extension/manifest_chrome.json',
				'mv dist/extension/manifest_firefox.json dist/extension/manifest.json'
			].join( '&&' ),
			webextLint: 'web-ext lint',
			webextRun: 'web-ext run --start-url https://en.wikipedia.org/wiki/Special:Random --no-reload --verbose --browser-console'
		},
		compress: {
			// Compress source code for upload to Firefox web store. Chrome doesn't require this.
			webextSource: {
				options: {
					archive: () => {
						// Default source archive, if no other zip file exists.
						let out = './dist/extension_firefox/who_wrote_that_source.zip';
						// Get the existing zip file name and strip '.zip' from end.
						// The trailing 0 (which we use to identify the non-source zip)
						// is set above in the replace.manifest Grunt task.
						const existingZip = grunt.file.expand( './dist/extension_firefox/*0.zip' );
						if ( existingZip.length >= 1 ) {
							const basename = existingZip[ 0 ];
							out = basename.substr( 0, basename.length - 4 ) + '_source.zip';
						}
						grunt.log.ok( 'Compressing source to ' + out );
						return out;
					},
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

	grunt.registerTask( 'extLocales', 'Create web extension locale files in dist/extension/_locales/ (call as "extLocales:beta" for beta versions)', beta => {
		const isBeta = beta === 'beta',
			langBlob = generateLangBlob(),
			qqq = grunt.file.readJSON( 'i18n/qqq.json' );
		Object.keys( langBlob ).forEach( function ( lang ) {
			const localeFile = 'dist/extension/_locales/' + lang + '/messages.json',
				betaLogMsg = isBeta ? 'beta ' : '',
				nameMsg = isBeta ? 'whowrotethat-ext-name-beta' : 'whowrotethat-ext-name',
				descMsg = isBeta ? 'whowrotethat-ext-desc-beta' : 'whowrotethat-ext-desc',
				// The name and description messages default to English because Chrome doesn't do
				// its own fallbacks.
				locale = {
					name: {
						message: langBlob.en[ nameMsg ],
						description: qqq[ nameMsg ]
					},
					description: {
						message: langBlob.en[ descMsg ],
						description: qqq[ descMsg ]
					}
				};
			// Name (may be for beta). Maximum length 45 characters.
			if ( langBlob[ lang ][ nameMsg ] ) {
				const name = langBlob[ lang ][ nameMsg ];
				if ( name.length >= 45 ) {
					grunt.log.error( 'The ' + lang + " '" + nameMsg + "' message must be 45 characters or less. Provided: " + name );
				}
				locale.name.message = name.substring( 0, 44 );
			}
			// Description (may have beta appended). Maximum 132 characters.
			if ( langBlob[ lang ][ descMsg ] ) {
				const desc = langBlob[ lang ][ descMsg ];
				if ( desc.length >= 132 ) {
					grunt.log.error( 'The ' + lang + " '" + descMsg + "' message must be 132 characters or less. Provided: " + desc );
				}
				locale.description.message = desc.substring( 0, 131 );
			}
			// Write the locale file.
			grunt.log.ok( 'Writing ' + betaLogMsg + 'messages to ' + localeFile );
			grunt.file.write( localeFile, JSON.stringify( locale, null, 4 ) );
		} );
	} );

	grunt.registerTask( 'chromeManifest', () => {
		// Here we make the required changes for Chrome's extension manifest and locale files.
		const manifest = grunt.file.readJSON( 'dist/extension/manifest.json' );
		// Remove non-Chrome key.
		// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_specific_settings
		delete manifest.browser_specific_settings;
		grunt.file.write( 'dist/extension/manifest_chrome.json', JSON.stringify( manifest, null, 4 ) );
	} );

	grunt.registerTask( 'lint', [ 'eslint', 'stylelint', 'banana', 'jsdoc' ] );
	grunt.registerTask( 'test', [ 'lint', 'shell:mocha' ] );
	grunt.registerTask( 'build', 'Create web extension files in dist/extension/', [ 'clean', 'less', 'replace', 'browserify', 'copy', 'extLocales' ] );
	grunt.registerTask( 'run', [ 'build', 'webext', 'shell:webextRun' ] );
	grunt.registerTask( 'webext', 'Build zip files for upload to the browser stores', [
		'build', 'chromeManifest',
		// Create beta zip files.
		'extLocales:beta', 'shell:webextBuild', 'shell:webextLint', 'compress:webextSource',
		// Create prod zip files.
		'extLocales', 'shell:webextBuild', 'shell:webextLint', 'compress:webextSource'
	] );
	grunt.registerTask( 'default', [ 'test', 'build', 'webext' ] );
};

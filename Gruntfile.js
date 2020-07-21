// eslint-disable-next-line jsdoc/require-jsdoc
module.exports = function Gruntfile( grunt ) {
	const pkg = grunt.file.readJSON( 'package.json' ),
		// Get all language files
		langFiles = grunt.file
			.expand( { filter: 'isFile', cwd: 'i18n' }, [ '*' ] )
			.filter( f => f !== 'qqq.json' ),
		langBlob = {},
		/**
		 * Generate a language JSON blob from the i18n translation files
		 *
		 * @return {Object} JSON object of all translations, keyed by language code
		 */
		generateLangBlob = () => {
			if ( langBlob.en !== undefined ) {
				return langBlob;
			}

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
			const betaLogMsg = isBeta ? 'beta ' : '',
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
				const name = langBlob[ lang ][ nameMsg ],
					nameLengthMax = 45;
				if ( name.length > nameLengthMax ) {
					grunt.log.error( 'The ' + lang + " '" + nameMsg + "' message must be " + nameLengthMax + ' characters or less. Provided: ' + name );
				}
				locale.name.message = name.substring( 0, nameLengthMax );
			}
			// Description (may have beta appended). Maximum 132 characters.
			if ( langBlob[ lang ][ descMsg ] ) {
				const desc = langBlob[ lang ][ descMsg ],
					descLengthMax = 132;
				if ( desc.length > descLengthMax ) {
					grunt.log.error( 'The ' + lang + " '" + descMsg + "' message must be " + descLengthMax + ' characters or less. Provided: ' + desc );
				}
				locale.description.message = desc.substring( 0, descLengthMax );
			}
			// Write the locale file. The directory name must use underscores, not hyphens.
			let langDirname = lang;
			const langParts = lang.split( '-', 2 );
			if ( langParts.length > 1 ) {
				// Use underscore, and uppercase the latter parts.
				langDirname = langParts[ 0 ] + '_' + langParts[ 1 ].toUpperCase();
			}
			if ( lang === 'pt' ) {
				// Handle one-off code difference between TranslateWiki and browser stores.
				langDirname = 'pt_PT';
			}
			const localeFile = 'dist/extension/_locales/' + langDirname + '/messages.json';
			grunt.log.ok( 'Writing ' + betaLogMsg + 'messages to ' + localeFile );
			grunt.file.write( localeFile, JSON.stringify( locale, null, 4 ) );
		} );
	} );

	/**
	 * Check the names and descriptions used on the Firefox Addons store.
	 * Non-matching ones need to be updated manually, as there is no write API for these.
	 * The addons API documentation is at https://addons-server.readthedocs.io/
	 */
	grunt.registerTask( 'checkListings', function ( beta ) {
		const isBeta = beta === 'beta',
			nameMsg = isBeta ? 'whowrotethat-ext-name-beta' : 'whowrotethat-ext-name',
			descMsg = isBeta ? 'whowrotethat-ext-desc-beta' : 'whowrotethat-ext-desc',
			longDescMsg = 'whowrotethat-ext-longdesc',
			fetch = require( 'node-fetch' ),
			addonName = 'whowrotethat' + ( isBeta ? '-beta' : '' ),
			url = 'https://addons.mozilla.org/api/v4/addons/addon/' + addonName,
			langBlob = generateLangBlob(),
			done = this.async();
		fetch( url )
			.then( res => res.json() )
			.then( json => {
				if ( json.detail === 'Not found.' ) {
					grunt.log.error( 'Unable to retrieve Addon information for ' + addonName );
					return;
				}
				// Check each available language to see if it's the same as in the remote listing.
				Object.keys( langBlob ).forEach( function ( lang ) {
					// Handle language code differences between Translatewiki and Firefox Addons.
					let listingLang = lang;
					if ( lang === 'en' ) {
						listingLang = 'en-US';
					} else if ( lang === 'pt' ) {
						listingLang = 'pt-PT';
					} else if ( lang === 'pt-br' ) {
						listingLang = 'pt-BR';
					} else if ( lang === 'sv' ) {
						listingLang = 'sv-SE';
					} else if ( lang === 'nb' ) {
						listingLang = 'nb-NO';
					}
					// Name.
					if ( langBlob[ lang ][ nameMsg ] !== undefined &&
						json.name[ listingLang ] !== langBlob[ lang ][ nameMsg ]
					) {
						grunt.log.error( 'Name does not match for ' + lang + '. Correct value:' );
						grunt.log.writeln( langBlob[ lang ][ nameMsg ] );
					}
					// Summary.
					if ( langBlob[ lang ][ descMsg ] !== undefined &&
						json.summary[ listingLang ] !== langBlob[ lang ][ descMsg ]
					) {
						grunt.log.error( 'Summary does not match for ' + lang + '. Correct value:' );
						grunt.log.writeln( langBlob[ lang ][ descMsg ] );
					}
					// Description.
					if ( langBlob[ lang ][ longDescMsg ] !== undefined &&
						json.description[ listingLang ] !== langBlob[ lang ][ longDescMsg ]
					) {
						grunt.log.error( 'Description does not match for ' + lang + '. Correct value:' );
						grunt.log.writeln( langBlob[ lang ][ longDescMsg ] );
					}
				} );
				done();
			} );
	} );

	/**
	 * This task configures the manifest.json files for Chrome and Firefox.
	 * It might look like it'd be better to make the contents of build/extension_manifest.json
	 * match what we need for Chrome, and then this would only need to add the Gecko ID. We don't do
	 * that because we want to be able to run the extension locally in Firefox (we do get a warning
	 * in Chrome with this setup, but that's preferable to storage.sync not working at all, which is
	 * what happens in Firefox if no ID is set).
	 */
	grunt.registerTask( 'extManifests', beta => {
		const isBeta = beta === 'beta',
			manifest = grunt.file.readJSON( 'dist/extension/manifest.json' );

		// Firefox: set extension ID.
		manifest.browser_specific_settings.gecko.id = isBeta ? 'whowrotethat-beta@wikimedia' : '{7c53a467-2542-497a-86fb-59c2904a56d1}';
		grunt.file.write( 'dist/extension/manifest.json', JSON.stringify( manifest, null, 4 ) );

		// Chrome: remove non-Chrome key.
		// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_specific_settings
		delete manifest.browser_specific_settings;
		grunt.file.write( 'dist/extension/manifest_chrome.json', JSON.stringify( manifest, null, 4 ) );
	} );

	grunt.registerTask( 'lint', [ 'eslint', 'stylelint', 'banana', 'jsdoc' ] );
	grunt.registerTask( 'test', [ 'lint', 'shell:mocha' ] );
	grunt.registerTask( 'build', 'Create web extension files in dist/extension/', [ 'clean', 'less', 'replace', 'browserify', 'copy', 'extLocales' ] );
	grunt.registerTask( 'run', [ 'build', 'webext', 'shell:webextRun' ] );
	grunt.registerTask( 'webext', 'Build zip files for upload to the browser stores', [
		'build',
		// Create beta zip files.
		'extManifests:beta', 'extLocales:beta', 'shell:webextBuild', 'shell:webextLint', 'compress:webextSource',
		// Create prod zip files.
		'extManifests', 'extLocales', 'shell:webextBuild', 'shell:webextLint', 'compress:webextSource'
	] );
	grunt.registerTask( 'default', [ 'test', 'build', 'webext' ] );
};

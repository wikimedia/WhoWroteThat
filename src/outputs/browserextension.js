import activationInstance from '../ActivationSingleton';
import languageBlob from '../../temp/languages'; // This is generated during the build process

( function () {
	const onActivateButtonClick = e => {
			activationInstance.loadDependencies()
				.then( () => {
					// Only load after dependencies are loaded
					const App = require( '../App' ),
						a = new App();
					a.start();
				} );

			e.preventDefault();
			return false;
		},
		loadWhoWroteThat = () => {
			activationInstance.initialize(
				$( '.mw-parser-output' ),
				{
					lang: $( 'html' ).attr( 'lang' ),
					translations: languageBlob,
					namespace: mw.config.get( 'wgCanonicalNamespace' ),
					mainPage: mw.config.get( 'wgIsMainPage' )
				}
			);
			activationInstance.getButton().on( 'click', onActivateButtonClick );
		};

	var q = window.RLQ || ( window.RLQ = [] );
	q.push( [ [ 'jquery', 'mediawiki.base', 'mediawiki.util', 'mediawiki.jqueryMsg' ], loadWhoWroteThat ] );
}() );

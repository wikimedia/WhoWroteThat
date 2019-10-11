import config from '../config';
import wwtController from '../Controller';
import languageBlob from '../../temp/languages'; // This is generated during the build process

( function () {
	/**
	 * A method responding to click on the activation button
	 *
	 * @param  {jQuery.Event} e Event data
	 * @return {boolean} false
	 */
	const onActivateButtonClick = e => {
			wwtController.toggle();
			e.preventDefault();
			return false;
		},
		/**
		 * Preliminary activation method for WWT
		 * This runs early, as soon as ResourceLoader loaded the base
		 * packages that we need to add the portlet and load jquery.
		 */
		loadWhoWroteThat = () => {
			wwtController.initialize(
				$( '.mw-parser-output' ),
				{
					lang: $( 'html' ).attr( 'lang' ),
					translations: languageBlob,
					namespace: mw.config.get( 'wgCanonicalNamespace' ),
					mainPage: mw.config.get( 'wgIsMainPage' ),
					wikiWhoUrl: config.wikiWhoUrl
				}
			);
			wwtController.getButton().on( 'click', onActivateButtonClick );
		};

	var q = window.RLQ || ( window.RLQ = [] );
	q.push( [ [ 'jquery', 'mediawiki.base', 'mediawiki.util', 'mediawiki.jqueryMsg' ], loadWhoWroteThat ] );

	// For debugging purposes, export methods to the window global
	window.wwtDebug = {
		resetWelcomePopup: () => {
			// Notify the extension
			window.postMessage( {
				from: 'whowrotethat',
				type: 'tour-welcome',
				action: 'reset'
			}, '*' );
		},
		launch: wwtController.launch.bind( wwtController ),
		dismiss: wwtController.dismiss.bind( wwtController )
	};
}() );

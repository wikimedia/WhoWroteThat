import config from '../config';
import wwtController from '../Controller';
import languageBlob from '../../temp/languages'; // This is generated during the build process
config.outputEnvironment = 'Browser extension';

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
		 * Load the welcome tour popup.
		 */
		loadWhoWroteThatWelcomeTour = () => {
			$.when(
				$.ready,
				mw.loader.using( [
					'oojs-ui',
					'mediawiki.jqueryMsg'
				] )
			).then( function () {
				// Verify we are only loading the tour if the button is available,
				// this is more of a sanity check.
				if ( !$( '#t-whowrotethat' ).length ) {
					return;
				}

				// Only load after dependencies are loaded
				const $overlay = $( '<div>' ).addClass( 'wwt-overlay' ),
					WelcomePopupWidget = require( '../WelcomePopupWidget' ),
					welcome = new WelcomePopupWidget( {
						$floatableContainer: $( '#t-whowrotethat' ),
						$overlay
					} );
				let popupShown = false;

				welcome.on( 'dismiss', function () {
					// Notify the extension
					window.postMessage( {
						from: 'whowrotethat',
						type: 'tour-welcome',
						action: 'dismiss'
					}, '*' );

					// Hide the popup
					welcome.toggle( false );
				} );

				$( 'html' ).addClass( 'wwt-popup' );
				$( 'body' ).append( $overlay );
				$overlay.append( welcome.$element );

				// Show the popup if the model is enabled and the popup wasn't
				// already shown in this session.
				if ( !popupShown && wwtController.getModel().isEnabled() ) {
					welcome.toggle( true );
					popupShown = true;
				}

				// When the model is enabled, double check if the popup
				// should be shown. This is especially for cases where WWT
				// loads on a page where VE is loading as well. In that case,
				// the popup would not show because VE will disable the link,
				// but we might want to have it shown if VE is dismissed
				// and the WWT system loads on the page again.
				// Either way, we only want this to happen once per this session.
				wwtController.getModel().on( 'enabled', function ( isEnabled ) {
					var show = isEnabled && !popupShown;

					welcome.toggle( show );
					popupShown = popupShown || show;
				} );
			} );
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

			// Check whether to load the tour
			if (
				$( 'html' ).hasClass( 'wwt-welcome-tour-unseen' ) &&
				wwtController.getModel().isValidPage()
			) {
				loadWhoWroteThatWelcomeTour();
			}

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

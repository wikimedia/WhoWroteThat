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

	$( document ).ready( () => {
		var welcomeTourSeen = window.localStorage.getItem( 'WelcomeTourSeen' ),
			$overlay = $( '<div>' ).addClass( 'ext-wwt-overlay' );

		loadWhoWroteThat();

		if ( welcomeTourSeen || !activationInstance.isValidPage() ) {
			// Do not show the tour if it was previously dismissed
			// Or if the page is invalid
			return;
		}

		$.when(
			$.ready,
			mw.loader.using( [
				'oojs-ui',
				'mediawiki.jqueryMsg'
			] )
		).then( () => {
			const WelcomePopupWidget = require( '../WelcomePopupWidget' ),
				welcome = new WelcomePopupWidget( {
					$floatableContainer: $( '#t-whowrotethat' ),
					$overlay: $overlay
				} );

			welcome.on( 'dismiss', function () {
				// This is a gadget that may also work for
				// non logged in users, so we can't trust
				// the mw.user.options storage.
				// Store the fact that the tour was
				// dismissed in localStorage
				window.localStorage.setItem( 'WelcomeTourSeen', true );
				// Hide the popup
				welcome.toggle( false );
			} );

			// Show the popup
			$( 'html' ).addClass( 'ext-wwt-popup' );
			$( 'body' ).append( $overlay );
			$overlay.append( welcome.$element );
			welcome.toggle( true );
		} );
	} );

	// For debugging purposes, export methods to the window global
	window.wwtDebug = {
		resetWelcomePopup: () => {
			window.localStorage.removeItem( 'WelcomeTourSeen' );
			window.console.log( 'WhoWroteThat Extension: Welcome tour reset. Please refresh.' );
		}
	};
}() );

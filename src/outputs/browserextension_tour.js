( function () {
	function loadWhoWroteThatWelcomeTour() {
		$.when(
			$.ready,
			mw.loader.using( [
				'oojs-ui',
				'mediawiki.jqueryMsg'
			] )
		).then( function () {
			// The check about whether the tour was already seen has already
			// taken place at this point. This whole file would not be injected
			// by the contentScript to begin with, if WelcomeTourSeen is true
			if ( !$( '#t-whowrotethat' ).length ) {
				return;
			}

			// Only load after dependencies are loaded
			const $overlay = $( '<div>' ).addClass( 'ext-wwt-overlay' ),
				WelcomePopupWidget = require( '../WelcomePopupWidget' ),
				welcome = new WelcomePopupWidget( {
					$floatableContainer: $( '#t-whowrotethat' ),
					$overlay
				} );

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

			// Show the popup
			$( 'html' ).addClass( 'ext-wwt-popup' );
			$( 'body' ).append( $overlay );
			$overlay.append( welcome.$element );
			welcome.toggle( true );
		} );
	}

	// eslint-disable-next-line vars-on-top
	var q = window.RLQ || ( window.RLQ = [] );
	q.push( [ [ 'jquery', 'mediawiki.base' ], loadWhoWroteThatWelcomeTour ] );
}() );

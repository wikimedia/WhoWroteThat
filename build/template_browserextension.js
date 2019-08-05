( function () {
	var languageJson = @@languageBlob;
	function loadWhoWroteThat() {
		var interfaceLang = $( 'html' ).attr( 'lang' ),
			$button = $( '<a>' )
				.text( 'WhoWroteThat' )
				.addClass( 'wwt-activationButton' )
				.prependTo( '#p-personal' )
				.click( onActivateButtonClick );

		// Load messages
		mw.messages.set( $.extend(
			// Make sure to fallback on English
			languageJson.en,
			languageJson[ interfaceLang ]
		) );

		// Attach button to DOM; jQuery is available

		function onActivateButtonClick( e ) {
			mw.loader.using( [ 'oojs-ui' ] ).then( function () {

@@fullScript

			} );
		}


	}

	var q = window.RLQ || ( window.RLQ = [] );
	q.push( [ [ 'jquery', 'mediawiki.base', 'mediawiki.jqueryMsg' ], loadWhoWroteThat ] );

}() );

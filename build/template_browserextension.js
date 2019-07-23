( function () {
	function loadWhoWroteThat() {
		var $button = $( '<a>' )
			.text( 'WhoWroteThat' )
			.addClass( 'wwt-activationButton' )
			.prependTo( '#p-personal' )
			.click( onActivateButtonClick );

		// Attach button to DOM; jQuery is available

		function onActivateButtonClick( e ) {
			mw.loader.using( [ 'oojs-ui' ] ).then( function () {

<%= fullScript %>

			} );
		}
	}

	var q = window.RLQ || ( window.RLQ = [] );
	q.push( [ [ 'jquery', 'mediawiki.base' ], loadWhoWroteThat ] );
}() );

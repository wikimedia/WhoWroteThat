( function ( $, mw ) {
	function loadWhoWroteThat() {
		var $button = $( <a> )
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
}( jQuery, mediawiki ) );

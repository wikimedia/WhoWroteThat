( function () {
	var languageJson = @@languageBlob;
	function loadWhoWroteThat() {
		@@jqueryInitialization

		// Initialize
		wwtActivationSingleton.initialize( languageJson, onActivateButtonClick );

		function onActivateButtonClick( e ) {
			mw.loader.using( [ 'oojs-ui', 'oojs-ui.styles.icons-user', 'oojs-ui.styles.icons-interactions' ] ).then( function () {

@@fullScript

			} );

			e.preventDefault();
			return false;
		}


	}

	var q = window.RLQ || ( window.RLQ = [] );
	q.push( [ [ 'jquery', 'mediawiki.base', 'mediawiki.util', 'mediawiki.jqueryMsg' ], loadWhoWroteThat ] );

}() );

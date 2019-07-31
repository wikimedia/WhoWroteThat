( function () {
	var api = new extwrt.Api( { url: extwrt.globals.wikicolorUrl } );

	api.getData( window.location.href ).done( function ( result ) {
		$( '#mw-content-text' ).replaceWith( result.extended_html );
	} );

	// TEST!
	OO.ui.alert( 'The extension is working! URL: ' + api.getAjaxURL( window.location.href ) );
}() );

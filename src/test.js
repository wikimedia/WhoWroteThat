( function () {
	var api = new extwrt.Api( { url: extwrt.globals.wikicolorUrl } );
	// TEST!
	OO.ui.alert( 'The extension is working! URL: ' + api.getAjaxURL( window.location.href ) );
}() );

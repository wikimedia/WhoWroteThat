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

/**
 * Browser extension for WhoWroteThat 0.1.0
 * Wikimedia Foundation
 */
/* >> Starting source: src/globals.js << */

	// Define a variable that will be used throughout the code
	// This isn't quite a global variable because it's only used
	// inside the extension, but it is used as one through writing
	// the individual files in /src, and will be used to store all
	// the necessary objects and methods when the build step
	// concatenates the files for the extension release.
	var extwrt = { // eslint-disable-line no-unused-vars
		ui: {},
		dm: {},
		globals: {
			wikicolorUrl: 'https://www.wikiwho.net/'
		}
	};
/* >> End source: src/globals.js << */
/* >> Starting source: src/Api.js << */

	var Api = function ( config ) {
		config = config || {};
		this.tries = 0;
		this.url = config.url || window.location;
	};

	/**
	 * Get the value of a paramter from the given URL query string.
	 *
	 * @param  {string} querystring URL query string
	 * @param  {string} param Parameter name
	 * @return {string|null} Parameter value; null if not found
	 */
	Api.prototype.getQueryParameter = function ( querystring, param ) {
		var urlParams, regex, results;

		try {
			urlParams = new URLSearchParams( querystring );
			return urlParams.get( param );
		} catch ( err ) {
			// Fallback for IE and Edge
			// eslint-disable-next-line no-useless-escape
			param = param.replace( /[\[]/, '\\[' ).replace( /[\]]/, '\\]' );
			regex = new RegExp( '[\\?&]' + param + '=([^&#]*)' );
			results = regex.exec( querystring );

			return results === null ? '' : decodeURIComponent( results[ 1 ].replace( /\+/g, ' ' ) );
		}
	};

	/**
	 * Get the relevant AJAX url from whocolor based on the given
	 * base URL of the wiki.
	 *
	 * @param  {string} baseURL URL of the wiki page that we want to analyze.
	 * @return {string} Ajax URL for the data from whocolor
	 */
	Api.prototype.getAjaxURL = function ( baseURL ) {
		var queryString, parts, oldId,
			linkNode = document.createElement( 'a' );

		linkNode.href = baseURL;
		queryString = linkNode.search.substring( 1 );
		oldId = this.getUrlParameter( queryString, 'oldid' );

		parts = [
			baseURL,
			location.hostname.split( '.' )[ 0 ], // Wiki language
			'/whocolor/v1.0.0-beta/',
			encodeURIComponent( $( 'h1#firstHeading' ).text().trim() ), // Page title
			'/'
		];

		if ( oldId ) {
			parts.push( oldId + '/' );
		}

		return parts.join();
	};

	Api.prototype.getData = function ( url ) {
		return $.getJSON( url || this.url )
			.then(
				this.onAjaxSuccess.bind( this ),
				this.onAjaxFailure.bind( this )
			);
	};

	Api.prototype.onAjaxSuccess = function () {};

	Api.prototype.onAjaxFailure = function () {};

	extwrt.Api = Api;
/* >> End source: src/Api.js << */
/* >> Starting source: src/test.js << */

	// TEST!
	OO.ui.alert( 'The extension is working!' );
/* >> End source: src/test.js << */

			} );
		}
	}

	var q = window.RLQ || ( window.RLQ = [] );
	q.push( [ [ 'jquery', 'mediawiki.base' ], loadWhoWroteThat ] );
}() );

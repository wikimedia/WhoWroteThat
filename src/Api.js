/**
 * @param {Object} config
 * @cfg config.url The WikiColor base URL.
 * @constructor
 */
extwrt.Api = function ( config ) {
	config = config || {};
	this.tries = 0;
	this.url = config.url || '';

	// Remove trailing slash.
	if ( this.url && this.url.slice( -1 ) === '/' ) {
		this.url = this.url.slice( 0, -1 );
	}
};

/**
 * Get the value of a paramter from the given URL query string.
 *
 * @param  {string} querystring URL query string
 * @param  {string} param Parameter name
 * @return {string|null} Parameter value; null if not found
 */
extwrt.Api.prototype.getQueryParameter = function ( querystring, param ) {
	var urlParams, regex, results;

	if ( querystring === '' ) {
		return null;
	}

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
 * @param  {string} wikiUrl URL of the wiki page that we want to analyze.
 * @return {string} Ajax URL for the data from whocolor
 */
extwrt.Api.prototype.getAjaxURL = function ( wikiUrl ) {
	var parts, oldId, title, lang, matches, queryString,
		linkNode = document.createElement( 'a' );
	linkNode.href = wikiUrl;
	queryString = linkNode.search;

	title = this.getQueryParameter( queryString, 'title' );
	if ( title ) {
		// URL is like: https://en.wikipedia.org/w/index.php?title=Foo&oldid=123
		matches = linkNode.hostname.match( /([a-z]+)\.wiki.*/i );
		lang = matches[ 1 ];
	} else {
		// URL is like: https://en.wikipedia.org/wiki/Foo
		matches = wikiUrl.match( /:\/\/([a-z]+).wikipedia.org\/wiki\/(.*)/i );
		lang = matches[ 1 ];
		title = matches[ 2 ];
	}

	parts = [
		this.url,
		lang,
		'whocolor/v1.0.0-beta',
		title
	];

	// Add oldid if it's present.
	oldId = this.getQueryParameter( queryString, 'oldid' );
	if ( oldId ) {
		parts.push( oldId );
	}

	// Compile the full URL.
	return parts.join( '/' );
};

extwrt.Api.prototype.getData = function ( url ) {
	return $.getJSON( url || this.url )
		.then(
			this.onAjaxSuccess.bind( this ),
			this.onAjaxFailure.bind( this )
		);
};

extwrt.Api.prototype.onAjaxSuccess = function () {
};

extwrt.Api.prototype.onAjaxFailure = function () {
};

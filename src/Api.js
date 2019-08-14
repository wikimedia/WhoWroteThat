/**
 * Interface to the [WikiWho](https://www.wikiwho.net/) WhoColor API.
 *
 * @class
 */
class Api {
	/**
	* @param {Object} config
	* @cfg config.url The WikiWho base URL.
	* @constructor
	*/
	constructor( config = {} ) {
		this.url = config.url || '';

		// Remove trailing slash.
		if ( this.url && this.url.slice( -1 ) === '/' ) {
			this.url = this.url.slice( 0, -1 );
		}

		this.results = null;
	}

	/**
	 * Get the value of a parameter from the given URL query string.
	 *
	 * @protected
	 * @param  {string} querystring URL query string
	 * @param  {string} param Parameter name
	 * @return {string|null} Parameter value; null if not found
	 */
	getQueryParameter( querystring, param ) {
		let urlParams, regex, results;

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
			regex = new RegExp( `[?&]${param}=([^&#]*)` );
			results = regex.exec( querystring );

			return results === null ? '' : decodeURIComponent( results[ 1 ].replace( /\+/g, ' ' ) );
		}
	}

	/**
	 * Get a WhoColor API URL based on a given wiki URL.
	 *
	 * @param  {string} wikiUrl URL of the wiki page that we want to analyze.
	 * @return {string} Ajax URL for the data from WhoColor.
	 */
	getAjaxURL( wikiUrl ) {
		let parts, oldId, title, lang, matches, queryString,
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
		return parts.join( '/' ) + '/';
	}

	/**
	 * Extract token and editor IDs from a WikiWho span element with `id='token-X'` and
	 * `class='token-editor-Y'` attributes.
	 *
	 * @param {HTMLElement} element
	 * @return {Object} An object with two parameters: tokenId and editorId (string).
	 */
	getIdsFromElement( element ) {
		const out = { tokenId: false, editorId: false },
			tokenMatches = element.id.match( /token-(\d+)/ ),
			editorMatches = element.className.match( /token-editor-([^\s]+)/ );
		if ( tokenMatches && tokenMatches[ 1 ] ) {
			out.tokenId = parseInt( tokenMatches[ 1 ] );
		}
		if ( editorMatches && editorMatches[ 1 ] ) {
			out.editorId = editorMatches[ 1 ];
		}
		return out;
	}

	/**
	 * Get the WikiWho replacement for `.mw-parser-output` HTML.
	 * @return {string}
	 */
	getReplacementHtml() {
		return this.results.extended_html;
	}

	/**
	 * Get user and revision information for a given token.
	 *
	 * @param {int} tokenId
	 * @return {{revisionId: *, score: *, userId: *, username: *, revisionTime: *}|boolean} Object
	 * that represents the token info or false if a token wasn't found.
	 */
	getTokenInfo( tokenId ) {
		let revId, revision, username, score;

		// Get the token information. results.tokens structure:
		// [ [ conflict_score, str, o_rev_id, in, out, editor/class_name, age ], ... ]
		// e.g. Array(7) [ 0, "indicate", 769691068, [], [], "18201938", 76652371.587203 ]
		const token = this.results.tokens[ tokenId ];
		if ( !token ) {
			return false;
		}

		// Get revision information. results.revisions structure:
		// { rev_id: [ timestamp, parent_rev_id, user_id, editor_name ], ... }
		// e.g. Array(4) [ "2017-03-11T02:12:47Z", 769315355, "18201938", "Biogeographist" ]
		revId = token[ 2 ];
		revision = this.results.revisions[ revId ];
		username = revision[ 3 ];

		// Get the user's edit score (percentage of content edited).
		// results.present_editors structure:
		// [ [ username, user_id, score ], ... ]
		for ( let i = 0; i < this.results.present_editors.length; i++ ) {
			if ( this.results.present_editors[ i ][ 0 ] === username ) {
				score = parseFloat( this.results.present_editors[ i ][ 2 ] ).toFixed( 1 );
				break;
			}
		}

		// Put it all together.
		return {
			username: username,
			userId: token[ 5 ],
			revisionId: revId,
			revisionTime: new Date( revision[ 0 ] ),
			score: score
		};
	}

	/**
	 * Get the WikiWho data for a given wiki page.
	 *
	 * @param {string} wikiUrl URL of the wiki page that we want to analyze.
	 * @return {Promise} A promise that resolves when the data is ready,
	 * or rejects if there was an error.
	 */
	getData( wikiUrl ) {
		const api = this;
		if ( this.resultsPromise ) {
			return this.resultsPromise;
		}
		this.resultsPromise = $.getJSON( this.getAjaxURL( wikiUrl ) )
			.then( function ( result ) {
				// Handle error response.
				if ( !result.success && result.info ) {
					// The API gives us an error message, but we don't use it because it's only
					// in English.
					return $.Deferred().reject( 'ext-whowrotethat-api-error-wikiwho-generic' );
				}
				// Store all results.
				api.results = result;
			} );
		return this.resultsPromise;
	}
}

export default Api;

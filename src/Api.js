import Tools from './Tools';

/**
 * Interface to the [WikiWho](https://www.wikiwho.net/) WhoColor API.
 *
 * @class
 */
class Api {
	/**
	* @param {Object} config
	* @cfg config.url The WikiWho base URL.
	* @cfg config.mwApi The mw.Api instance.
	* @cfg config.mwConfig The mw.config data (a mw.Map object).
	* @constructor
	*/
	constructor( config = {} ) {
		// Remove trailing slash from URL.
		this.url = ( config.url || '' ).replace( /\/$/, '' );

		this.mwApi = config.mwApi;
		this.mwConfig = config.mwConfig;
		this.promiseCache = { data: {}, summaries: {} };
		this.tokenMap = {};
		this.maxRetries = 4;
		this.retry = 1;
	}

	/**
	 * Check whether a revision ID promise is cached
	 *
	 * @param  {string} revId Revision ID
	 * @param  {string} [type='summaries'] Promise data type
	 *  'summaries' or 'data'
	 * @return {boolean} The promise is cached
	 */
	isCached( revId, type = 'summaries' ) {
		return !!(
			this.promiseCache[ type ] &&
			this.promiseCache[ type ][ revId ]
		);
	}
	/**
	 * Fetch core messages needed for the revision popup, etc., making them available to mw.msg().
	 * This is called just after the script is first loaded, and the request completes very quickly,
	 * so we shouldn't need to bother with promises and such.
	 */
	fetchMessages() {
		this.mwApi.loadMessages( [
			'parentheses-start',
			'talkpagelinktext',
			'pipe-separator',
			'contribslink',
			'parentheses-end'
		] );
	}

	/**
	 * Get parsed edit summary for the given revision.
	 *
	 * @param {number} revId
	 * @return {jQuery.Promise} Resolving Object with keys 'comment' and 'size'.
 	 */
	fetchEditSummary( revId ) {
		/**
		 * Fetch the edit summary for the given revision from the MediaWiki API
		 *
		 * @return {jQuery.Promise} Promise that is resolved with the summary
		 *  information as an object with the comment and size, or is rejected
		 *  if the summary could not have been fetched.
		 */
		const fetchSummaryPromise = () => {
			return this.mwApi.ajax( {
				action: 'compare',
				fromrev: revId,
				torelative: 'prev',
				prop: 'parsedcomment|size',
				formatversion: 2
			} ).then(
				data => {
					if ( data.compare ) {
						return {
							comment: data.compare.toparsedcomment,
							size: data.compare.tosize - ( data.compare.fromsize || 0 )
						};
					}
					return $.Deferred().reject();
				},
				failData => {
					return $.Deferred().reject( failData );
				}
			);
		};

		// If the promise isn't cached yet, fetch it
		if ( !this.promiseCache.summaries[ revId ] ) {
			this.promiseCache.summaries[ revId ] = fetchSummaryPromise();
		}

		return this.promiseCache.summaries[ revId ];
	}

	/**
	 * Get a WhoColor API URL based on a given wiki URL.
	 *
	 * @private
	 * @return {string} Ajax URL for the data from WhoColor.
	 */
	getAjaxURL() {
		// Get the subdomain, or fallback on the language code (unlikely).
		let domainParts = this.mwConfig.get( 'wgServerName' ).match( /^([^.]*)\./ ),
			subdomain = domainParts[ 1 ] !== undefined ? domainParts[ 1 ] : this.mwConfig.get( 'wgContentLanguage' );

		// Compile the full URL.
		return [
			this.url,
			subdomain,
			'whocolor/v1.0.0-beta',
			this.mwConfig.get( 'wgPageName' ),
			// Always include the revision ID, to make sure we are always asking for
			// the correct revision, whether the page was just edited, or, whether the
			// page was edited by someone else while we were looking at the current page
			this.mwConfig.get( 'wgRevisionId' )
		].join( '/' ) + '/';
	}

	/**
	 * Get the revision ID of the current content.
	 *
	 * This serves as a pointer to the current content, and the needed promise
	 * requested from the API.
	 * The promise is unique if the revision ID is the same, and should
	 * change (and hence force a refetch) if the revision ID changed, like
	 * in the case of looking at the page after a VE save (without refresh)
	 *
	 * @return {string} Revision ID for the current content
	 */
	getRevisionId() {
		return this.mwConfig.get( 'wgRevisionId' );
	}

	/**
	 * Get user and revision information for a given token.
	 *
	 * @param {number} tokenId Token ID
	 * @return {{revisionId: *, score: *, userId: *, username: *, revisionTime: *}|boolean} Object
	 * that represents the token info or false if a token wasn't found.
	 */
	getTokenInfo( tokenId ) {
		return this.tokenMap[ tokenId ];
	}

	/**
	 * Create a map of token IDs and the data needed for the UI
	 *
	 * @private
	 * @param  {Object} results API results
	 */
	createTokenMap( results ) {
		// Reset
		this.tokenMap = {};

		// Map tokens to the new data
		for ( let tokenId in results.tokens ) {
			this.tokenMap[ tokenId ] = this.parseTokenInfo( results, tokenId );
		}
	}

	/**
	 * Parse token information from the API result
	 *
	 * @private
	 * @param {Object} results Api results
	 * @param {number} tokenId Token ID
	 * @return {{revisionId: *, score: *, userId: *, username: *, revisionTime: *}|boolean} Object
	 * that represents the token info or false if a token wasn't found.
	 */
	parseTokenInfo( results, tokenId ) {
		let revId, revision, username, isIP, score;

		// Get the token information. results.tokens structure:
		// [ [ conflict_score, str, o_rev_id, in, out, editor/class_name, age ], ... ]
		// e.g. Array(7) [ 0, "indicate", 769691068, [], [], "18201938", 76652371.587203 ]
		const token = results.tokens[ tokenId ];
		if ( !token ) {
			return false;
		}

		// Get revision information. results.revisions structure:
		// { rev_id: [ timestamp, parent_rev_id, user_id, editor_name ], ... }
		// e.g. Array(4) [ "2017-03-11T02:12:47Z", 769315355, "18201938", "Biogeographist" ]
		revId = token[ 2 ];
		revision = results.revisions[ revId ];
		username = revision[ 3 ];

		// WikiWho prefixes IP addresses with '0|'.
		isIP = username.slice( 0, 2 ) === '0|';
		username = isIP ? username.slice( 2 ) : username;

		// Get the user's edit score (percentage of content edited).
		// results.present_editors structure:
		// [ [ username, user_id, score ], ... ]
		for ( let i = 0; i < results.present_editors.length; i++ ) {
			if ( results.present_editors[ i ][ 0 ] === username ) {
				score = parseFloat( results.present_editors[ i ][ 2 ] ).toFixed( 1 );
				break;
			}
		}

		// Put it all together.
		return {
			username: username,
			userId: token[ 5 ],
			isIP: isIP,
			revisionId: revId,
			revisionTime: new Date( revision[ 0 ] ),
			score: score
		};
	}

	/**
	 * Get the data from the WhoColor API
	 *
	 * @private
	 * @return {jQuery.Promise} A promise that is resolved when the
	 *  data from the WhoColor API is available, or when the attempt
	 *  failed for some error.
	 */
	getJsonData() {
		return $.getJSON( this.getAjaxURL() )
			.then( result => {
				// Handle error response.
				if ( !result.success ) {
					// The API gives us an error message, but we don't use it because it's only
					// in English. Some of the error messages are:
					// * result.info: "Requested data is not currently available in WikiWho
					//   database. It will be available soon."
					// * result.error: "The article (x) you are trying to request does not exist
					//   in english Wikipedia."
					// We do add the full error details to the console, for easier debugging.
					const errCode = result.info && result.info.match( /data is not currently available/i ) ?
						'refresh' : 'contact';
					Tools.log( 'WhoWroteThat encountered a "' + errCode + '" error:', 'error', result );
					if ( errCode === 'refresh' && this.retry <= this.maxRetries ) {
						// Return an intermediate Promise to handle the wait.
						// The time to wait gets progressively longer for each retry.
						return new Promise( resolve => setTimeout( resolve, 1000 * this.retry ) )
							.then( () => {
								// Followed by a (recursive) Promise to do the next request.
								Tools.log( 'WhoWroteThat Api::getData() retry ' + this.retry );
								this.retry++;
								// Recurse
								return this.getJsonData();
							} );
					}
					return $.Deferred().reject( errCode );
				}
				// Report retry count.
				if ( this.retry > 1 ) {
					Tools.log( 'WhoWroteThat Api::getData() total retries: ' + ( this.retry - 1 ) );
				}

				// Create the token map
				this.createTokenMap( result );

				// Return result
				return result;
			}, jqXHR => {
				// All other errors are likely to be 4xx and 5xx, and the only one that the user
				// might be able to recover from is 429 Too Many Requests.
				let errCode = 'contact';
				if ( jqXHR.status === 429 ) {
					errCode = 'later';
				}
				return $.Deferred().reject( errCode );
			} );
	}

	/**
	 * Get the WikiWho data for a given wiki page.
	 *
	 * @return {Promise} A promise that resolves when the data is ready,
	 * or rejects if there was an error.
	 */
	getData() {
		let promiseIdentifier = this.getRevisionId();

		// If this promise doesn't exist yet, fetch it
		if ( !this.promiseCache.data[ promiseIdentifier ] ) {
			this.promiseCache.data[ promiseIdentifier ] = this.getJsonData();
		}

		// Return the promise
		return this.promiseCache.data[ promiseIdentifier ];
	}
}

export default Api;

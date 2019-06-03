class Retriever {
	constructor( config ) {
		config = config || {};

		// this.url = config.url || this.getAjaxURL();
		this.tries = 0;
	}

	getUrlParameter( querystring, name ) {
		let urlParams, regex, results;

		try {
			urlParams = new URLSearchParams( querystring );
			return urlParams.get( name );
		} catch ( err ) {
			// Fallback for IE and Edge
			name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
			regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
			results = regex.exec( querystring );

			return results === null ? '' : decodeURIComponent( results[1].replace(/\+/g, ' ') );
		}
	};

	getAjaxURL( url ) {
		let querystring = url.split( '?' )[1];
			urlParams = new URLSearchParams( querystring || window.location.search),
			urlParts = [
				this.url,
				location.hostname.split('.')[0], // Wiki language
				'/whocolor/v1.0.0-beta/',
				encodeURIComponent( $( 'h1#firstHeading' ).text().trim() ), // Page title
				"/"
			],
			oldId = this.getUrlParameter( querystring, 'oldid' ),
			queryDict = {};


		// Check query parameters
		if ( oldId ) {
			urlParts.push( oldId + '/' );
		}

		return urlParts.join();
	}

	getData() {
		return $.getJSON( this.url )
			.then(
				this.onAjaxSuccess.bind( this ),
				this.onAjaxFailure.bind( this )
			);
	}

	onAjaxSuccess( data ) {

	}

	onAjaxFailure() {
		if ( this.tries > 3 ) {
			// Failed more than 3 times
			if(typeof Wikiwho.api_info !== "undefined") {
				alert(Wikiwho.api_info);
			} else if (typeof Wikiwho.api_error !== "undefined") {
				alert(Wikiwho.api_error);
			} else {
				alert("Failed to retrieve valid WikiWho data.");
			}

			// Reset
			this.tries = 0;
			return;
		}

		// Request failed, try again
		this.tries++;
		setTimeout(this.getData.bind( this ), 5000);  // 5 seconds
	}
}

module.exports = Retriever;

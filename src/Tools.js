import config from './config.js';

/**
 * Class to hold some global helper tools
 */
class Tools {
	/**
	 * Output into the console.
	 *
	 * Note: A similar method also exists in build/extension_content_script.jsdoc
	 *
	 * @param  {string} str String to output
	 * @param  {string} [type='debug'] Log type used for console output
	 *  valid options are:
	 *  - 'debug' for console.debug()
	 *  - 'info' for console.info()
	 *  - 'warn' for console.warn()
	 *  - 'error' for console.error()
	 * @param {Mixed} [params] Parameters to output into the console
	 *  alongside the message. This is especially useful for errors.
	 */
	static log( str, type = 'debug', params = undefined ) {
		const legalTypes = [ 'debug', 'info', 'warn', 'error' ],
			outputParameters = [ config.outputPrefix + str ];

		type = legalTypes.includes( type ) ? type : 'debug';

		if ( params !== undefined ) {
			outputParameters.push( params );
		}

		window.console[ type ].apply( window.console, outputParameters );
	}

	/**
	 * Encompass strings with BiDi isolation for RTL/LTR support.
	 * This should be used on any string that is content language,
	 * to make sure that if the user uses a different directionality
	 * in the interface language, the output is shown properly
	 * within a bidi isolation block.
	 *
	 * @param {jQuery|string} $content Content to isolate
	 * @return {jQuery} BiDi isolated jQuery object
	 */
	static bidiIsolate( $content ) {
		const $result = $( '<bdi>' ),
			// Append objects, but insert strings as text.
			appendMethod = typeof $content === 'string' ? 'text' : 'append';
		$result[ appendMethod ]( $content );
		return $result;
	}

	/**
	 * Use jQuery objects (or strings) as i18n message parameters,
	 * without having to parse translator-supplied strings as HTML.
	 *
	 * @param {string} msg The i18n message name.
	 * @param {jQuery|string} params jQuery objects or strings to insert into the message.
	 * @return {string}
	 */
	static i18nHtml( msg, ...params ) {
		const
			// Temporary marker string that will be replaced (with an integer appended).
			// Must not appear in messages.
			marker = '@@I18N',
			// Create a list of parameter markers.
			replacements = Object.keys( params ).map( ( k ) => marker + k );
		// Insert the markers into the message, in place of $1, $2, etc.
		let outputMsg = mw.msg.apply( null, [ msg ].concat( replacements ) );
		// Replace each marker in the message with the actual HTML.
		replacements.forEach( ( rep, idx ) => {
			const param = params[ idx ],
				// Parameters can be string or jQuery. If string, escape it using jQuery.
				val = typeof param === 'string' ? $( '<div>' ).text( param ).html() : param[ 0 ].outerHTML;
			outputMsg = outputMsg.replace( marker + idx, val );
		} );
		// Return the final HTML-containing message string.
		return outputMsg;
	}
}
export default Tools;

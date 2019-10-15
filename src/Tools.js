import config from './config';

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
	static log( str, type = 'debug', params ) {
		const legalTypes = [ 'debug', 'info', 'warn', 'error' ],
			outputParameters = [ config.outputPrefix + str ];

		type = legalTypes.indexOf( type ) > -1 ? type : 'debug';

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
}
export default Tools;

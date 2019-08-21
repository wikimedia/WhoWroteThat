/**
 * injectScript - Inject internal script to available access to the `window`
 *
 * @param  {string} filePath Local path of the internal script.
 * @param  {string} tag The tag as string, where the script will be append (default: 'body').
 * @see    {@link http://stackoverflow.com/questions/20499994/access-window-variable-from-content-script}
 */
function injectScript( filePath, tag ) {
	var node = document.getElementsByTagName( tag )[ 0 ],
		script = document.createElement( 'script' );

	script.setAttribute( 'type', 'text/javascript' );
	script.setAttribute( 'src', filePath );
	node.appendChild( script );
}

// Write to console, for later debugging and bug filtering process for the extension
window.console.info( 'WhoWroteThat Extension: Loaded on page.' );

// Inject page script into the DOM
injectScript( chrome.extension.getURL( 'js/generated.pageScript.js' ), 'body' );

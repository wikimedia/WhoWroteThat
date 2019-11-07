var theBrowser = chrome || browser;

/**
 * Unify the way we output console.info
 * We have this tool in Tools.log but that code is not yet loaded when this file runs.
 *
 * @param {string} str String to output
 */
function log( str ) {
	window.console.info( 'Who Wrote That? (Browser extension): ' + str );
}
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

/**
 * Consider whether to activate the initial welcome tour
 * and listen to dismissal event if so. If dismissal event
 * happened, store that state so the welcome tour is never
 * shown again.
 */
function activateWelcomeTour() {
	theBrowser.storage.sync.get( [ 'WelcomeTourSeen' ], function ( result ) {
		log( 'Checking WelcomeTourSeen (' + !!result.WelcomeTourSeen + ')' );
		if ( result.WelcomeTourSeen ) {
			return;
		}

		// Set a class on the HTML so the script knows taht the welcome tour
		// should load
		document.getElementsByTagName( 'html' )[ 0 ]
			.classList.add( 'wwt-welcome-tour-unseen' );
		log( 'Tagging welcome tour for activation.' );
	} );
}

// Add a listener for the DOM operations
window.addEventListener( 'message', function ( event ) {
	if ( event.source !== window ) {
		return;
	}

	if (
		event.data &&
		event.data.from === 'whowrotethat'
	) {
		// Welcome popup
		if ( event.data.type === 'tour-welcome' ) {
			// Set the variable according to the action
			theBrowser.storage.sync.set( {
				// For 'dismiss', set true; for 'reset', set false
				WelcomeTourSeen: event.data.action === 'dismiss'
			}, function () {
				if ( event.data.action === 'dismiss' ) {
					log( 'Welcome tour dismissed.' );
				} else {
					log( 'Welcome tour re-enabled.' );
				}
			} );
		}
	}
}, false );

// Write to console, for later debugging and bug filtering process for the extension
log( 'Loaded on page.' );

// Inject page script into the DOM
injectScript( theBrowser.extension.getURL( 'js/generated.pageScript.js' ), 'body' );

// Activate welcome tour
activateWelcomeTour();

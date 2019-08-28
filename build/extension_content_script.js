var theBrowser = chrome || browser;
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
		window.console.log( 'WhoWroteThat extension: Checking WelcomeTourSeen (' + result.WelcomeTourSeen + ')' );
		if ( result.WelcomeTourSeen ) {
			return;
		}

		// Inject the welcome tour script
		window.console.log( 'WhoWroteThat extension: Injecting welcome tour' );
		injectScript( theBrowser.extension.getURL( 'js/generated.welcomeTour.js' ), 'body' );
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
				window.console.log( 'WhoWroteThat Extension: Welcome tour dismissed.' );
			} );
		}
	}
}, false );

// Write to console, for later debugging and bug filtering process for the extension
window.console.info( 'WhoWroteThat Extension: Loaded on page.' );

// Inject page script into the DOM
injectScript( theBrowser.extension.getURL( 'js/generated.pageScript.js' ), 'body' );

// Activate welcome tour
activateWelcomeTour();

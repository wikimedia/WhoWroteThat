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

		// Set a class on the HTML so the script knows that the welcome tour
		// should load
		document.getElementsByTagName( 'html' )[ 0 ]
			.classList.add( 'wwt-welcome-tour-unseen' );
		log( 'Tagging welcome tour for activation.' );
	} );
}

/**
 * Event handler for the 'message' event on the window.
 *
 * @param {MessageEvent} event
 */
function messageListener( event ) {
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
}

/**
 * The main browser extension entry point.
 */
function main() {
	const contentScriptId = 'wwt-content-script';
	// If the script has already been injected, exit.
	if ( document.getElementById( contentScriptId ) ) {
		log( 'Already injected; aborting.' );
		return;
	}
	// Add a listener for the DOM operations
	window.addEventListener( 'message', messageListener );

	// Inject page script into the DOM
	const script = document.createElement( 'script' ),
		node = document.getElementsByTagName( 'body' )[ 0 ];
	script.id = contentScriptId;
	script.type = 'text/javascript';
	script.src = theBrowser.extension.getURL( 'js/generated.pageScript.js' );
	node.appendChild( script );

	// Write to console, for later debugging and bug filtering process for the extension
	log( 'Loaded on page.' );

	// Activate welcome tour
	activateWelcomeTour();
}

main();

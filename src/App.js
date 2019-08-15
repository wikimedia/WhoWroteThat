import config from './config';
import Api from './Api';
import InfoBarWidget from './InfoBarWidget';
import activationInstance from './ActivationSingleton';

/**
 * Application class, responsible for running, activating,
 * and toggling the entire application.
 *
 * @class
 */
class App {
	/**
	 * Only instantiate once, so the initialization doesn't run again
	 * even if this is called on multiple clicks/calls
	 *
	 * @constructor
	 * @param {App} A class instance
	 */
	constructor() {
		// Instantiate only once
		if ( !App.instance ) {
			this.initialized = false;
			App.instance = this;
		}

		return App.instance;
	}

	/**
	 * Initialize the application
	 */
	initialize() {
		// Only initialize once
		if ( this.initialized ) {
			return;
		}

		this.widget = new InfoBarWidget( { state: 'pending' } );
		this.api = new Api( { url: config.wikiWhoUrl } );

		this.widget.setState( 'pending' );
		// Attach widget
		if ( $( 'body' ).hasClass( 'skin-timeless' ) ) {
			$( '#mw-content-wrapper' ).prepend( this.widget.$element );
		} else {
			$( '#content' ).prepend( this.widget.$element );
		}

		// Attach events
		this.widget.on( 'close', this.onWidgetClose.bind( this ) );
		this.initialized = true;
	}

	/**
	 * Run the application.
	 * This performs the initialization for the first time
	 * and then can do the toggling when and if the activation
	 * button is clicked multiple times, toggling the state
	 * on and off and on again.
	 */
	start() {
		const self = this;

		this.initialize();
		this.widget.toggle( true );

		this.api.getData( window.location.href )
			.then(
				// Success handler.
				() => {
					// Insert modified HTML.
					$( '.mw-parser-output' ).html( self.api.getReplacementHtml() );
					// Highlight when hover a user's contributions.
					// @TODO This is just testing code and should be
					// replaced by the proper behaviour.
					$( '.mw-parser-output .editor-token' )
						.on( 'mouseenter', function () {
							const ids = self.api.getIdsFromElement( this );
							// Activate all this user's contribution spans.
							$( '.token-editor-' + ids.editorId ).addClass( 'active' );
							// Information for popup.
							// eslint-disable-next-line no-console
							console.log( self.api.getTokenInfo( ids.tokenId ) );
						} )
						.on( 'mouseleave', function () {
							// Deactivate all spans.
							$( '.mw-parser-output .editor-token' ).removeClass( 'active' );
						} );
					self.widget.setState( 'ready' );
				},
				// Error handler.
				errorCode => {
					self.widget.setState( 'err' );
					self.widget.setErrorMessage( errorCode );
				}
			);
	}

	/**
	 * Repond to the close event that the widget emits.
	 * Toggle the application off, and replace the content
	 * to the original dom of the original article.
	 */
	onWidgetClose() {
		// Close button; revert back to the original content
		activationInstance.getContentWrapper()
			.replaceWith( activationInstance.getOriginalContent() );

		// Hide the widget
		this.widget.toggle( false );
	}
}

// This should be able to load with 'require'
module.exports = App;
export default App;

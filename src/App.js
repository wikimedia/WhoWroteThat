import config from './config';
import Api from './Api';
import InfoBarWidget from './InfoBarWidget';
import RevisionPopupWidget from './RevisionPopupWidget';
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

		this.revisionPopup = new RevisionPopupWidget();

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
		this.api = new Api( {
			url: config.wikiWhoUrl,
			mwApi: new mw.Api()
		} );

		// Pull in necessary core messages.
		this.api.fetchMessages();

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
		this.initialize();

		// Close if already open.
		if ( this.widget.isVisible() ) {
			this.onWidgetClose();
			return;
		}

		// Otherwise, proceed to open and fetch data.
		this.widget.toggle( true );
		activationInstance.toggleLink( true );

		this.api.getData( window.location.href )
			.then(
				// Success handler.
				() => {
					// The widget might have been closed since getData began.
					if ( !this.widget.isVisible() ) {
						return;
					}
					// Insert modified HTML.
					const $contentWrapper = activationInstance.getContentWrapper();
					activationInstance.setOriginalContent( $contentWrapper );
					$contentWrapper.html( this.api.getReplacementHtml() );
					$( 'body' ).append( this.revisionPopup.$element );
					this.attachContentListeners();
					this.widget.setState( 'ready' );
				},
				// Error handler.
				errorCode => {
					this.widget.setState( 'err' );
					this.widget.setErrorMessage( errorCode );
				}
			);
		// Add a class for CSS to style links appropriately. Is removed in this.onWidgetClose().
		activationInstance.getContentWrapper().addClass( 'ext-wwt-enabled' );
	}

	/**
	 * Activate all the spans belonging to the given user.
	 * @param {number} editorId
	 */
	activateSpans( editorId ) {
		$( '.token-editor-' + editorId ).addClass( 'active' );
	}

	/**
	 * Deactivate all spans.
	 */
	deactivateSpans() {
		$( '.mw-parser-output .editor-token' ).removeClass( 'active' );
	}

	/**
	 * Add listeners to:
	 *   - highlight attribution;
	 *   - show the RevisionPopupWidget; and
	 *   - scroll to the right place for fragment links.
	 */
	attachContentListeners() {
		$( '.mw-parser-output .editor-token' )
			.on( 'mouseenter', e => {
				if ( this.revisionPopup.isVisible() ) {
					return;
				}
				const ids = this.api.getIdsFromElement( e.currentTarget );
				this.activateSpans( ids.editorId );
			} )
			.on( 'mouseleave', () => {
				if ( this.revisionPopup.isVisible() ) {
					return;
				}
				this.deactivateSpans();
			} );

		$( '.editor-token' ).on( 'click', e => {
			const ids = this.api.getIdsFromElement( e.currentTarget ),
				tokenInfo = this.api.getTokenInfo( ids.tokenId );
			this.activateSpans( ids.editorId );
			this.revisionPopup.show( tokenInfo, $( e.currentTarget ) );
			this.revisionPopup.once( 'toggle', this.deactivateSpans );

			// Fetch edit summary then re-render the popup.
			this.api.fetchEditSummary( tokenInfo.revisionId ).then( successData => {
				Object.assign( tokenInfo, successData );
				this.revisionPopup.show( tokenInfo, $( e.target ) );
			}, () => {
				// Silently fail. The revision info provided by WikiWho is still present, which is
				// the important part, so we'll just show what we have and throw a console warning.
				mw.log.warn( `WhoWroteThat failed to fetch the summary for revision ${tokenInfo.revisionId}` );
			} );
		} );

		/*
		 * Modify fragment link scrolling behaviour to take into account the width of the infobar at
		 * the top of the screen, to prevent the targeted heading or citation from being hidden.
		 */
		$( "a[href^='#']" ).on( 'click', event => {
			var targetId, linkOffset, infobarHeight;
			if ( !this.widget.isVisible() ) {
				// Use the default if WWT is not active.
				return;
			}
			targetId = decodeURIComponent( event.currentTarget.hash ).replace( /^#/, '' );
			event.preventDefault();
			// After preventing the default event from doing it, set the URL bar fragment manually.
			window.location.hash = targetId;
			// After setting that, manually scroll to the correct place.
			linkOffset = $( document.getElementById( targetId ) ).offset().top;
			infobarHeight = this.widget.$element.outerHeight( true );
			window.scrollTo( 0, linkOffset - infobarHeight );
		} );
	}

	/**
	 * Respond to the close event that the widget emits.
	 * Toggle the application off, and replace the content
	 * to the original dom of the original article.
	 */
	onWidgetClose() {
		// Close button; revert back to the original content
		const $contentWrapper = activationInstance.getContentWrapper();
		$contentWrapper.removeClass( 'ext-wwt-enabled' );
		$contentWrapper.html( activationInstance.getOriginalContent().html() );

		// Hide the widget and update the sidebar link.
		this.widget.toggle( false );
		activationInstance.toggleLink( false );
	}
}

// This should be able to load with 'require'
module.exports = App;
export default App;

import Api from './Api';
import Model from './Model';
import Tools from './Tools';

/**
 * An activation singleton, responsible for activating and attaching the
 * button that activates the system when it is applicable.
 *
 * @class
 */
class Controller {
	/**
	 * Initialize if it is the first time, and cache the
	 * initialization for the next times.
	 */
	constructor() {
		if ( !Controller.instance ) {
			this.initialized = false;
			this.$button = null;
			this.$link = null;
			this.$overlay = null;
			this.namespace = null;
			this.mainPage = false;
			this.translations = {};
			this.contentIdentifier = null;

			Controller.instance = this;

			this.app = null;
			this.api = null;
			this.model = new Model();

			// Events
			this.model.on( 'active', isActive => {
				this.toggleLinkActiveState( isActive );
				this.model.getContentWrapper()
					.toggleClass( 'wwt-active', isActive );

				// If we're deactivating, remove the state classes
				if ( !isActive ) {
					this.model.getContentWrapper()
						.removeClass( 'wwt-ready' );
				}
			} );

			// Events
			this.model.on( 'enabled', isEnabled => {
				this.getButton().toggle( isEnabled );
			} );

			this.model.on( 'state', state => {
				// Toggle a class for CSS to style links appropriately.
				this.model.getContentWrapper()
					.toggleClass( 'wwt-ready', state === 'ready' );
			} );
		}

		// eslint-disable-next-line no-constructor-return
		return Controller.instance;
	}

	/**
	 * Get the model attached to this controller
	 *
	 * @return {Model} Current model
	 */
	getModel() {
		return this.model;
	}

	/**
	 * Get the API class attached to this controller
	 *
	 * @return {Api} Current API
	 */
	getApi() {
		return this.api;
	}

	/**
	 * Initialize the process
	 *
	 * @param {jQuery} $content Page content
	 * @param {Object} config Configuration options
	 * @param {string} [config.lang="en"] User interface language
	 * @param {Object} [config.translations={}] Object with all translations
	 *  organized by language key with data of translation key/value pairs.
	 * @param {string} [config.namespace] Page namespace. Falls back to reading
	 *  directly from mw.config
	 * @param {string} [config.mainPage] Whether the current page is the main page
	 *  of the wiki. Falls back to reading directly from mw.config
	 */
	initialize( $content, config ) {
		let uri,
			veLoading = false;

		if ( this.model.isInitialized() ) {
			return;
		}
		this.model.initialize( $content, config );

		if ( !this.model.isValidPage() ) {
			return;
		}
		this.translations = config.translations || {};

		// This validation is for tests, where
		// mw is not defined. We don't care to test
		// whether messages are set properly, since that
		// has its own tests in the mw.messsages bundle
		if ( window.mw ) {
			uri = new mw.Uri();

			this.api = new Api( {
				url: config.wikiWhoUrl,
				mwApi: new mw.Api(),
				mwConfig: mw.config
			} );
			this.api.fetchMessages();

			// Load all messages
			mw.messages.set(
				Object.assign(
					{},
					// Manually create fallback on English
					this.translations.en,
					this.translations[ this.model.getLang() ]
				)
			);

			// Initial state
			this.getButton().toggle( this.model.isEnabled() );

			// Add hooks for VisualEditor
			mw.hook( 've.activationComplete' ).add( () => {
				Tools.log( 'VisualEditor activated, disabling system.' );

				this.dismiss();
				this.model.toggleEnabled( false );
			} );
			mw.hook( 've.deactivationComplete' ).add( () => {
				Tools.log( 'VisualEditor deactivated, enabling system.' );

				// Re-initialize the model, repeating what's done in browserextension.js
				// This is due to VE replacing the content element,
				// rather than inserting new contents into it.
				// eslint-disable-next-line no-jquery/no-global-selector
				this.model.initialize( $( '.mw-parser-output' ), config );
				this.model.toggleEnabled( true );
			} );

			this.initialized = true;

			// Mark as enabled after initialization, only if ve is not activated
			// This is specifically for the case where we load the page with VE
			// in the process of loading. In that case, if we leave VE after it
			// loaded, the events above will trigger a change in the enabled state
			// eslint-disable-next-line no-jquery/no-class-state
			veLoading = $( document.documentElement ).hasClass( 've-activated' ) ||
				(
					uri &&
						(
							uri.query.veaction === 'edit' ||
							uri.query.action === 'edit'
						)
				);

			this.model.toggleEnabled( !veLoading );
		}
	}

	/**
	 * Launch WWT application
	 *
	 * @return {jQuery.Promise} Promise that is resolved when the system
	 *  has finished launching, or is rejected if the system has failed to launch
	 */
	launch() {
		if ( !this.model.isEnabled() ) {
			Tools.log( 'Could not launch. System is disabled.' );
			return $.Deferred().reject();
		}

		return this.loadDependencies().then( () => {
			if ( !this.app ) {
				// Only load after dependencies are loaded
				// And only load once
				// We do this trick because our widgets are dependent
				// on OOUI, which is not available at construction time.
				// When we launch, we load dependencies and the first run
				// should make sure we also initialize the widget app
				const App = require( './App' );
				this.app = new App();
			}

			this.model.toggleActive( true );
			this.model.setState( 'pending' );
			return this.api.getData()
				.then(
					// Success handler.
					result => {
						// There could be time that passed between
						// activating the promise request and getting the
						// answer. During that time, the user may
						// have dismissed the system.
						// We should only replace the DOM and declare
						// ready if the system is actually ready to be
						// replaced.
						// On subsequent launches, this promise will run
						// again (no-op as an already-resolved promise)
						// and the operation below will be re-triggered
						// with the replacements
						if ( this.model.isActive() && this.model.getState() !== 'ready' ) {
							if (
								this.contentIdentifier !== this.api.getRevisionId()
							) {

								// The content we get from the API has changed
								this.app.resetContentFromHTML( result.extended_html );
								this.contentIdentifier = this.api.getRevisionId();
							}

							// Cache original
							this.model.cacheOriginal();
							this.model.getContentWrapper()
								.empty()
								.append( this.app.getInteractiveContent() );
							this.model.setState( 'ready' );
						}

						return this.model.getContentWrapper();
					},
					// Error handler.
					errorCode => {
						this.model.setState( 'err', errorCode );
					}
				);
		} );
	}

	/**
	 * Close the WWT application
	 */
	dismiss() {
		if ( !this.model.isActive() ) {
			Tools.log( 'Could not dismiss. System is not active.' );
			return;
		}

		if ( this.model.getState() === 'ready' ) {
			// Detach the interactive content so we can keep the events and data on it
			this.app.getInteractiveContent().detach();

			// Append the original content
			this.model.getContentWrapper()
				.append( this.model.getOriginalContent() );
		}

		this.model.toggleActive( false );
	}

	/**
	 * Toggle the system; if already launched, dismiss it, and vise versa.
	 */
	toggle() {
		if ( this.model.isActive() ) {
			this.dismiss();
		} else {
			this.launch();
		}
	}

	/**
	 * Set the link text and tooltip.
	 *
	 * @param {boolean} [active] The state to toggle to.
	 */
	toggleLinkActiveState( active ) {
		const $link = this.getLink();
		if ( active ) {
			$link.text( mw.msg( 'whowrotethat-deactivation-link' ) );
			$link.removeAttr( 'title' );
		} else {
			$link.text( mw.msg( 'whowrotethat-activation-link' ) );
			$link.attr( 'title', mw.msg( 'whowrotethat-activation-link-tooltip' ) );
		}
	}

	/**
	 * Load the required dependencies for the full script
	 *
	 * @return {jQuery.Promise} Promise that is resolved when
	 *  all dependencies are ready and loaded.
	 */
	loadDependencies() {
		if ( !window.mw ) {
			// This is for test environment only, where mw
			// is not defined.
			return $.Deferred().resolve();
		}

		return $.when(
			$.ready, // jQuery's document.ready
			mw.loader.using( [ // MediaWiki dependencies
				'oojs-ui',
				'oojs-ui.styles.icons-user',
				'oojs-ui.styles.icons-interactions',
				'mediawiki.interface.helpers.styles',
				'mediawiki.special.changeslist',
				'mediawiki.widgets.datetime',
				'moment'
			] )
		);
	}

	/**
	 * Get the activation button (which contains the activation link).
	 * Will add it if it doesn't already exist in the DOM.
	 *
	 * @return {jQuery} Activation button.
	 */
	getButton() {
		// If it's already been added to the DOM, return it.
		if ( this.$button instanceof $ ) {
			return this.$button;
		}
		// Otherwise, add a portlet link to the 'toolbox' portlet.
		this.$button = $( mw.util.addPortletLink(
			'p-tb',
			'#',
			mw.msg( 'whowrotethat-activation-link' ),
			't-whowrotethat',
			mw.msg( 'whowrotethat-activation-link-tooltip' )
		) );
		return this.$button;
	}

	/**
	 * Get the activation link, from inside the activation button.
	 *
	 * @return {jQuery} Activation link.
	 */
	getLink() {
		if ( this.$link instanceof $ ) {
			return this.$link;
		}
		this.$link = this.getButton().find( 'a' );
		return this.$link;
	}

	/**
	 * Get the overlay div with the class wwt-overlay
	 * Will add it if it doesn't already exist in the DOM.
	 *
	 * @return {jQuery} Overlay div
	 */
	getOverlay() {
		if ( this.$overlay instanceof $ ) {
			return this.$overlay;
		}
		this.$overlay = $( '<div>' ).addClass( 'wwt-overlay' );
		$( document.body ).append( this.$overlay );
		return this.$overlay;
	}

	/**
	 * Set the token that is currently active.
	 * Fetch the information that relates to the token, and update the model
	 * accordingly.
	 *
	 * @param {string} tokenId [description]
	 * @param {jQuery} $target [description]
	 */
	setActiveToken( tokenId, $target ) {
		const tokenInfo = this.getApi().getTokenInfo( tokenId ),
			reqStartTime = Date.now();

		// Ensure the popup is attached to the visible content,
		// which it otherwise wouldn't be for image thumbnails.
		if ( $target.find( '.thumb' ).length ) {
			$target = $target.find( '.thumb' );
		}

		if ( !this.getApi().isCached( tokenInfo.revisionId ) ) {
			this.model.setCurrentToken( null, $target, 'pending' );
		}
		this.getApi().fetchRevisionData( tokenInfo.revisionId )
			.then(
				successData => {
					const delayTime = (
						!this.getApi().isCached( tokenInfo.revisionId ) &&
						Date.now() - reqStartTime < 250
					) ? 250 : 0;

					Object.assign( tokenInfo, successData );

					setTimeout( () => {
						this.model.setCurrentToken( tokenInfo, $target, 'success' );
					}, delayTime );
				},
				// Failure
				() => {
					// Silently fail. The revision info provided by WikiWho
					// is still present, which is the important part,
					// so we'll just show what we have and throw a console
					// warning.
					mw.log.warn( `WhoWroteThat failed to fetch data for revision with ID ${tokenInfo.revisionId}` );
					this.model.setCurrentToken( null, $target, 'failure' );
				}
			);
	}
}

// Initialize the singleton
const wwtController = new Controller();

export default wwtController;

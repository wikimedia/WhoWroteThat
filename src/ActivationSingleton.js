/**
 * An activation singleton, responsible for activating and attaching the
 * button that activates the system when it is applicable.
 *
 * @class
 */
class ActivationSingleton {
	/**
	 * Initialize if it is the first time, and cache the
	 * initialization for the next times.
	 */
	constructor() {
		if ( !ActivationSingleton.instance ) {
			this.initialized = false;
			this.link = null;
			this.namespace = null;
			this.mainPage = false;
			this.$contentWrapper = null;
			this.$originalContent = null;
			this.lang = 'en';
			this.translations = {};

			ActivationSingleton.instance = this;
		}

		return ActivationSingleton.instance;
	}

	/**
	 * Check if the current page is valid
	 * for the system to display.
	 *
	 * @return {boolean} Page is valid
	 */
	isValidPage() {
		return !!(
			// Has the needed parser content
			this.$contentWrapper.length &&
			// Is in the main namespace
			this.namespace === '' &&
			// Is not main page
			!this.mainPage
		);
	}

	/**
	 * Set the class properties.
	 * This is separated from initialization for cleanliness
	 * and to make sure tests can run with different parameters.
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
	setProperties( $content, config ) {
		this.$contentWrapper = $content;
		this.$originalContent = this.$contentWrapper.clone();
		this.lang = config.lang || 'en';
		this.namespace = config.namespace || '';
		this.mainPage = !!config.mainPage;
		this.translations = config.translations || {};
	}

	/**
	 * Initialize the process
	 *
	 * @param {jQuery} $content Page content
	 * @param {Object} config Configuration options
	 */
	initialize( $content, config ) {
		this.setProperties( $content, config );

		if ( this.initialized || !this.isValidPage() ) {
			return;
		}

		// This validation is for tests, where
		// mw is not defined. We don't care to test
		// whether messages are set properly, since that
		// has its own tests in the mw.messsages bundle
		if ( window.mw ) {
			// Load all messages
			mw.messages.set(
				Object.assign(
					{},
					// Manually create fallback on English
					this.translations.en,
					this.translations[ this.lang ]
				)
			);

			// Add a portlet link to 'tools'
			this.link = mw.util.addPortletLink(
				'p-tb',
				'#',
				mw.msg( 'ext-whowrotethat-activation-link' ),
				't-whowrotethat',
				mw.msg( 'ext-whowrotethat-activation-link-tooltip' )
			);

			this.initialized = true;
		}
	}

	/**
	 * Load the required dependencies for the full script
	 *
	 * @return {jQuery.Promise} Promise that is resolved when
	 *  all dependencies are ready and loaded.
	 */
	loadDependencies() {
		return $.when(
			$.ready, // jQuery's document.ready
			mw.loader.using( [ // MediaWiki dependencies
				'oojs-ui',
				'oojs-ui.styles.icons-user',
				'oojs-ui.styles.icons-interactions'
			] )
		);
	}

	/**
	 * Get the jQuery object representing the activation button
	 *
	 * @return {jQuery} Activation button
	 */
	getButton() {
		return $( this.link );
	}

	/**
	 * Get the content wrapper for the current page
	 *
	 * @return {jQuery} Content wrapper
	 */
	getContentWrapper() {
		return this.$contentWrapper;
	}

	/**
	 * Get the original content of the article
	 *
	 * @return {jQuery} Original content
	 */
	getOriginalContent() {
		return this.$originalContent;
	}
}

// Initialize the singleton
const activationInstance = new ActivationSingleton();

export default activationInstance;

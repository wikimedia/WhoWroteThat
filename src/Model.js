const EventEmitter = require( 'events' );

/**
 * A class managing and storing the state of the system
 *
 * @extends EventEmitter
 */
class Model extends EventEmitter {
	/**
	 * Construct with the default values
	 */
	constructor() {
		super();

		this.initialized = false;
		this.enabled = true;
		this.active = false;
		this.state = 'pending';

		this.$originalContent = null;
		this.$contentWrapper = null;
		this.lang = 'en';
		this.namespace = '';
		this.mainPage = false;
	}

	/**
	 * Initialize the model with the given content and configuration
	 * This is done after the class is instantiated, when we are certain
	 * that the DOM loaded with all gadgets ready.
	 *
	 * @param {jQuery} $content jQuery object representing the content
	 * @param {Object} config Configuration object
	 * @param {string} [config.lang='en'] Interface language used
	 * @param {string} [config.namespace] Namespace of the current article
	 * @param {boolean} [config.mainPage] Whether the current page is the
	 *  wiki's main page
	 * @fires Model#initialized
	 */
	initialize( $content, config ) {
		this.$contentWrapper = $content;
		this.lang = config.lang || 'en';
		this.namespace = config.namespace || '';
		this.mainPage = !!config.mainPage;

		this.initialized = true;

		/**
		 * Initialization event
		 *
		 * @event Model#initialized
		 */
		this.emit( 'initialized' );
	}

	/**
	 * Cache the original content we are about to replace
	 *
	 * @param {jQuery} [$content=this.$contentWrapper.contents()] A jQuery
	 *  object to cache. If not given the $contentWrapper will
	 *  be cached. In most cases this should remain empty,
	 *  as $contentWrapper contains the original content before
	 *  it is replaced.
	 */
	cacheOriginal( $content = this.$contentWrapper.contents() ) {
		this.$originalContent = $content.clone( true, true );
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

	/**
	 * Check if the current page is valid
	 * for the system to display.
	 *
	 * @return {boolean} Page is valid
	 */
	isValidPage() {
		return !!(
			// Has the needed parser content
			this.getContentWrapper().length &&
			// Is in the main namespace
			this.namespace === '' &&
			// Is not main page
			!this.mainPage
		);
	}

	/**
	 * Check whether the model was initialized
	 *
	 * @return {boolean} Model was initialized
	 */
	isInitialized() {
		return this.initialized;
	}

	/**
	 * Check whether the system is enabled on this page
	 *
	 * @return {boolean} System is enabled
	 */
	isEnabled() {
		return this.enabled;
	}

	/**
	 * Check whether the system is currently active
	 *
	 * @return {boolean} System is active
	 */
	isActive() {
		return this.active;
	}

	/**
	 * Get the current state of the system.
	 * Possible values are 'pending', 'ready' or 'error'.
	 *
	 * @return {string} State of the system
	 */
	getState() {
		return this.state;
	}

	/**
	 * Get the interface language used
	 *
	 * @return {string} Interface language
	 */
	getLang() {
		return this.lang;
	}

	/**
	 * Toggle the active state of the system
	 *
	 * @fires Model#active
	 * @param {boolean} [state] System is active
	 */
	toggleActive( state ) {
		// If state isn't given, use the flipped value of the current state
		state = state !== undefined ? !!state : !this.active;

		if ( this.active !== state ) {
			this.active = state;

			/**
			 * Activation event
			 *
			 * @event Model#active
			 * @type {boolean}
			 * @param {boolean} isActive System is currently active
			 */
			this.emit( 'active', this.active );
		}
	}

	/**
	 * Toggle whether the system is currently enabled
	 *
	 * @fires Model#enabled
	 * @param {boolean} [state] System is enabled
	 */
	toggleEnabled( state ) {
		// If state isn't given, use the flipped value of the current state
		state = state !== undefined ? !!state : !this.active;

		if ( this.enabled !== state ) {
			this.enabled = state;

			/**
			 * Activation event
			 *
			 * @event Model#enabled
			 * @type {boolean}
			 * @param {boolean} isEnabled System is currently active
			 */
			this.emit( 'enabled', this.enabled );
		}
	}

	/**
	 * Set the state of the system. Legal values are 'pending', 'ready', or 'err'
	 * For 'err' state, an error code is optionally given.
	 *
	 * @fires Model#state
	 * @param {string} state System state
	 * @param {string} [errorCode=''] Error code type, if the state is an error
	 */
	setState( state, errorCode = '' ) {
		if (
			[ 'pending', 'ready', 'err' ].indexOf( state ) > -1 &&
			this.state !== state
		) {
			this.state = state;
			/**
			 * State change event
			 *
			 * @event Model#state
			 * @type {boolean}
			 * @param {string} System changed its state
			 * @param {string} Error code, if provided
			 */
			this.emit( 'state', this.state, errorCode );
		}
	}
}

export default Model;

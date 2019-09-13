import Tools from './Tools';

/**
 * @class
 * @param {Object} config Configuration options.
 * @param {string} config.state The state of the infobar; see {@link InfoBarWidget#setState}.
 * @constructor
 */
const InfoBarWidget = function InfoBarWidget( config = {} ) {
	// Parent constructor
	OO.ui.ButtonWidget.parent.call( this, config );
	OO.ui.mixin.IconElement.call( this, config );
	OO.ui.mixin.LabelElement.call( this, config );
	OO.ui.mixin.TitledElement.call( this, config );
	OO.ui.mixin.FlaggedElement.call( this, config );

	this.closeIcon = new OO.ui.IconWidget( {
		icon: 'clear',
		flags: [ 'invert' ],
		classes: [ 'ext-wwt-infoBarWidget-close' ]
	} );
	this.userInfoUsernameLabel = new OO.ui.LabelWidget();
	this.userInfoLabel = new OO.ui.LabelWidget( {
		label: mw.msg( 'ext-whowrotethat-ready-general' ),
		classes: [ 'ext-wwt-infoBarWidget-info' ]
	} );
	this.$pendingAnimation = $( '<div>' )
		.addClass( 'ext-wwt-infoBarWidget-spinner' )
		.append(
			$( '<div>' )
				.addClass( 'ext-wwt-infoBarWidget-spinner-bounce' )
		);

	// Set properties
	this.setState( config.state || 'pending' );
	this.toggle( false );
	this.setLabel( $( '<span>' ).append( mw.msg( 'ext-whowrotethat-state-pending' ) ).contents() );

	// Close event
	this.closeIcon.$element.on( 'click', () => this.emit( 'close' ) );

	// Initialize
	this.$element
		.addClass( 'ext-wwt-infoBarWidget' )
		.append(
			this.$pendingAnimation,
			this.$icon,
			this.$label,
			this.userInfoUsernameLabel.$element,
			this.userInfoLabel.$element,
			this.closeIcon.$element
		);
};

/* Setup */

OO.inheritClass( InfoBarWidget, OO.ui.Widget );
OO.mixinClass( InfoBarWidget, OO.ui.mixin.IconElement );
OO.mixinClass( InfoBarWidget, OO.ui.mixin.LabelElement );
OO.mixinClass( InfoBarWidget, OO.ui.mixin.TitledElement );
OO.mixinClass( InfoBarWidget, OO.ui.mixin.FlaggedElement );

/**
 * Define legal states for the widget
 *
 * @type {Array}
 */
InfoBarWidget.static.legalFlags = [ 'pending', 'ready', 'err' ];

/**
 * Change the state of the widget
 *
 * @param {string} state Widget state; 'pending', 'ready' or 'error'
 */
InfoBarWidget.prototype.setState = function ( state ) {
	const flags = {};

	if ( this.state !== state ) {
		this.constructor.static.legalFlags.forEach( flag => {
			flags[ flag ] = flag === state;
		} );
		flags.invert = true;

		this.setFlags( flags );

		if ( state === 'ready' ) {
			this.setLabel( $( '<span>' ).append( mw.msg( 'ext-whowrotethat-ready-title' ) ).contents() );
			this.userInfoLabel.setLabel( $( '<span>' ).append( mw.msg( 'ext-whowrotethat-ready-general' ) ).contents() );
			this.setIcon( 'userAvatar' );
		} else if ( state === 'pending' ) {
			this.setIcon( '' );
		} else {
			this.setIcon( 'error' );
			this.setErrorMessage();
		}

		this.$pendingAnimation.toggle( state === 'pending' );
		this.userInfoLabel.toggle( state === 'ready' );

		this.state = state;
	}
};

/**
 * Set an error with a specific label
 *
 * @param {string} errCode Error code as defined by the Api class.
 */
InfoBarWidget.prototype.setErrorMessage = function ( errCode = 'refresh' ) {
	// Messages used here:
	// ext-whowrotethat-error-refresh
	// ext-whowrotethat-error-later
	// ext-whowrotethat-error-contact
	let errorMessage = mw.msg( 'ext-whowrotethat-error-' + errCode );
	if ( errCode === 'contact' ) {
		// The contact error message is the only with with a different signature, so we handle it.
		const link = document.createElement( 'a' );
		link.href = 'https://meta.wikimedia.org/wiki/Talk:Community_Tech/Who_Wrote_That_tool';
		link.text = mw.msg( 'ext-whowrotethat-error-contact-link' );
		errorMessage = mw.message( 'ext-whowrotethat-error-contact', link ).parse();
	}
	this.setLabel( new OO.ui.HtmlSnippet( mw.msg( 'ext-whowrotethat-state-error', errorMessage ) ) );
};

/**
 * Show the given username information
 *
 * @param {string} username
 */
InfoBarWidget.prototype.setUsernameInfo = function ( username ) {
	this.userInfoUsernameLabel.setLabel( $( '<span>' ).append( Tools.bidiIsolate( username ) ).contents() );
};

// Clear the username information
InfoBarWidget.prototype.clearUsernameInfo = function () {
	this.userInfoUsernameLabel.setLabel( '' );
};

export default InfoBarWidget;

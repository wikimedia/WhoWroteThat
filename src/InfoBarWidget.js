var InfoBarWidget = function InfoBarWidget( config = {} ) {
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
		this.closeIcon.toggle( state !== 'pending' );

		this.state = state;
	}
};

/**
 * Set an error with a specific label
 *
 * @param {string} message Error label message key
 */
InfoBarWidget.prototype.setErrorMessage = function ( message = 'ext-whowrotethat-state-error-generic' ) {
	this.setLabel( mw.msg( 'ext-whowrotethat-state-error', mw.msg( message ) ) );
};

export default InfoBarWidget;

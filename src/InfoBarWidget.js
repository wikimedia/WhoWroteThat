import Tools from './Tools';
import wwtController from './Controller';

/**
 * @class
 * @param {Object} config Configuration options.
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
		classes: [ 'wwt-infoBarWidget-close' ]
	} );
	this.userInfoLabel = new OO.ui.LabelWidget( {
		label: mw.msg( 'whowrotethat-ready-general' ),
		classes: [ 'wwt-infoBarWidget-info' ]
	} );
	this.$pendingAnimation = $( '<div>' )
		.addClass( 'wwt-infoBarWidget-spinner' )
		.append(
			$( '<div>' )
				.addClass( 'wwt-infoBarWidget-spinner-bounce' )
		);

	// Set properties
	this.setState( wwtController.getModel().getState() );
	this.toggle( wwtController.getModel().isActive() );

	// Events
	this.closeIcon.$element.on( 'click', wwtController.dismiss.bind( wwtController ) );
	wwtController.getModel()
		.on( 'state', this.setState.bind( this ) );
	wwtController.getModel()
		.on( 'active', this.toggle.bind( this ) );

	// Initialize
	this.$element
		.addClass( 'wwt-infoBarWidget' )
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
 * @param {string} [errorCode] Error code, if applicable
 */
InfoBarWidget.prototype.setState = function ( state, errorCode = '' ) {
	const flags = {};

	if ( this.state !== state ) {
		this.constructor.static.legalFlags.forEach( flag => {
			flags[ flag ] = flag === state;
		} );
		flags.invert = true;

		this.setFlags( flags );

		if ( state === 'ready' ) {
			this.setIcon( 'userAvatar' );
			this.setLabel(
				$( '<span>' ).append(
					mw.msg( 'whowrotethat-ready-title' )
				).contents()
			);
			this.userInfoLabel.setLabel(
				$( '<span>' ).append(
					mw.msg( 'whowrotethat-ready-general' )
				).contents()
			);
		} else if ( state === 'pending' ) {
			this.setIcon( '' );
			const $pendingTitle = $( '<strong>' ).text( mw.msg( 'whowrotethat-state-pending-name' ) );
			this.setLabel( new OO.ui.HtmlSnippet( Tools.i18nHtml( 'whowrotethat-state-pending', $pendingTitle ) ) );
		} else {
			this.setIcon( 'error' );
			this.setErrorMessage( errorCode );
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
	// * whowrotethat-error-refresh
	// * whowrotethat-error-later
	// * whowrotethat-error-contact
	let errorMessage = mw.msg( 'whowrotethat-error-' + errCode );
	if ( errCode === 'contact' ) {
		// The contact error message is the only with with a different signature, so we handle it.
		const $link = $( '<a>' )
			.attr( 'href', 'https://meta.wikimedia.org/wiki/Talk:Community_Tech/Who_Wrote_That_tool' )
			.text( mw.msg( 'whowrotethat-error-contact-link' ) );
		errorMessage = Tools.i18nHtml( 'whowrotethat-error-contact', $link );
	}
	this.setLabel( new OO.ui.HtmlSnippet( mw.msg( 'whowrotethat-state-error', errorMessage ) ) );
};

export default InfoBarWidget;

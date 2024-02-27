import Tools from './Tools.js';

/**
 * A popup meant to display as a welcome message after the
 * extension is installed for the first time.
 *
 * @class
 * @extends OO.ui.PopupWidget
 *
 * @constructor
 * @param {Object} [config={}] Configuration options
 */
const WelcomePopupWidget = function WelcomePopupWidget( config = {} ) {
	const $content = $( '<div>' )
			.addClass( 'wwt-welcomePopupWidget-content' ),
		$title = $( '<strong>' )
			.text( mw.msg( 'whowrotethat-tour-welcome-title-name' ) );

	// Parent constructor
	WelcomePopupWidget.parent.call( this, Object.assign(
		{
			padded: true,
			autoClose: true,
			position: 'after',
			hideWhenOutOfView: false,
			$content: $content
		},
		config
	) );

	this.dismissButton = new OO.ui.ButtonWidget( {
		flags: [ 'primary', 'progressive' ],
		label: mw.msg( 'whowrotethat-tour-welcome-dismiss' )
	} );

	$content.append(
		$( '<div>' )
			.addClass( 'wwt-welcomePopupWidget-title' )
			.append( Tools.i18nHtml( 'whowrotethat-tour-welcome-title', $title ) ),
		$( '<div>' )
			.addClass( 'wwt-welcomePopupWidget-description' )
			.append( mw.msg( 'whowrotethat-tour-welcome-description' ) ),
		$( '<div>' )
			.addClass( 'wwt-welcomePopupWidget-button' )
			.append( this.dismissButton.$element )
	);

	// Events
	this.dismissButton.connect( this, { click: [ 'emit', 'dismiss' ] } );

	// Initialize
	this.$element
		.addClass( 'wwt-welcomePopupWidget' );
};

/* Setup */
OO.inheritClass( WelcomePopupWidget, OO.ui.PopupWidget );

/* Methods */

/**
 * @inheritdoc
 */
WelcomePopupWidget.prototype.toggle = function ( show ) {
	// Parent method
	WelcomePopupWidget.parent.prototype.toggle.call( this, show );

	// HACK: Prevent clipping; we don't want (or need) the
	// popup to clip itself when it's outside the viewport
	// or close to the viewport.
	// Unfortunately, the toggle operation calls toggleClipping
	// multiple times on and off, so we have to insist on it
	// being actually off at the end of it.
	this.toggleClipping( false );
};

module.exports = WelcomePopupWidget;
export default WelcomePopupWidget;

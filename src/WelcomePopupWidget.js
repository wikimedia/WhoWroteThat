/**
 * A popup meant to display as a welcome message after the
 * extension is installed for the first time.
 * @class
 * @extends OO.ui.PopupWidget
 *
 * @constructor
 * @param {Object} [config={}] Configuration options
 */
const WelcomePopupWidget = function WelcomePopupWidget( config = {} ) {
	const $content = $( '<div>' )
		.addClass( 'ext-wwt-welcomePopupWidget-content' );

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
		label: mw.msg( 'ext-whowrotethat-tour-welcome-dismiss' )
	} );

	$content.append(
		$( '<div>' )
			.addClass( 'ext-wwt-welcomePopupWidget-title' )
			.append( mw.msg( 'ext-whowrotethat-tour-welcome-title' ) ),
		$( '<div>' )
			.addClass( 'ext-wwt-welcomePopupWidget-description' )
			.append( mw.msg( 'ext-whowrotethat-tour-welcome-description' ) ),
		$( '<div>' )
			.addClass( 'ext-wwt-welcomePopupWidget-button' )
			.append( this.dismissButton.$element )
	);

	// Events
	this.dismissButton.connect( this, { click: [ 'emit', 'dismiss' ] } );

	// Initialize
	this.$element
		.addClass( 'ext-wwt-welcomePopupWidget' );
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

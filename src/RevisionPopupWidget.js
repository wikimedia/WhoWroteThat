import Tools from './Tools';

/**
 * @class
 * @constructor
 * @param {Model} model WhoWroteThat model
 * @param {Object} [config={}] Configuration options
 */
const RevisionPopupWidget = function RevisionPopupWidget( model, config = {} ) {
	const $shimmerSpan = $( '<span>' )
		.addClass( 'wwt-shimmer wwt-shimmer-animation' );

	this.model = model;
	this.$content = $( '<div>' )
		.addClass( 'wwt-revisionPopupWidget-content' );
	this.$loading = $( '<div>' )
		.append( $shimmerSpan, $shimmerSpan.clone(), $shimmerSpan.clone() );

	// Mixin constructors
	OO.ui.mixin.PendingElement.call( this );

	// Parent constructor
	RevisionPopupWidget.parent.call( this, Object.assign(
		{
			padded: true,
			autoClose: true,
			position: 'above',
			// FIXME: 'force-left' for RTL languages
			align: 'force-right',
			hideWhenOutOfView: false,
			$content: this.$content
		},
		config
	) );

	this.initialize();
	this.model.on( 'setToken', this.onModelSetToken.bind( this ) );
};

/* Setup */
OO.inheritClass( RevisionPopupWidget, OO.ui.PopupWidget );
OO.mixinClass( RevisionPopupWidget, OO.ui.mixin.PendingElement );

/**
 * Get jQuery objects for the user links.
 * @param {Object} data As returned by Api.prototype.getTokenInfo().
 * @return {jQuery}
 */
function getUserLinks( data ) {
	const contribsUrl = mw.util.getUrl( `Special:Contributions/${data.username}` ),
		// We typically link to Special:Contribs for IPs.
		userPageUrl = data.isIP ? contribsUrl : mw.util.getUrl( `User:${data.username}` );

	if ( !data.username ) {
		// Username was apparently suppressed.
		return $( '<span>' )
			.addClass( 'history-deleted' )
			// Note we can't use the native MediaWiki 'rev-deleted-user'
			// message because it can include parser functions.
			.text( mw.msg( 'whowrotethat-revision-deleted-username' ) );
	}

	return $( [] )
		.add(
			$( '<a>' )
				.attr( 'href', userPageUrl )
				.append( Tools.bidiIsolate( data.username ) )
		)
		.add( document.createTextNode( ' ' + mw.msg( 'parentheses-start' ) ) )
		.add(
			// Talk page
			$( '<a>' )
				.attr( 'href', mw.util.getUrl( `User talk:${data.username}` ) )
				.text( mw.msg( 'talkpagelinktext' ) )
		)
		.add( document.createTextNode( ' ' + mw.msg( 'pipe-separator' ) + ' ' ) )
		.add(
			$( '<a>' )
				.attr( 'href', contribsUrl )
				.text( mw.msg( 'contribslink' ) )
		)
		.add( document.createTextNode( mw.msg( 'parentheses-end' ) ) );
}

/**
 * Initialize the widget by building the content structure.
 */
RevisionPopupWidget.prototype.initialize = function () {
	this.diffSizeLabel = new OO.ui.LabelWidget( {
		classes: [ 'mw-diff-bytes' ]
	} );

	this.commentLabel = new OO.ui.LabelWidget();

	this.revisionAddedLabel = new OO.ui.LabelWidget( {
	} );

	this.scoreLabel = new OO.ui.LabelWidget( {
		classes: [ 'wwt-revisionPopupWidget-attribution' ]
	} );

	this.$animated = $( '<div>' )
		.append(
			this.revisionAddedLabel.$element,
			this.commentLabel.$element,
			this.diffSizeLabel.$element,
			this.scoreLabel.$element
		);
	this.$wrapper = $( '<div>' )
		.addClass( 'wwt-revisionPopupWidget-animate' )
		.append( this.$animated );

	// Build structure
	this.$content
		.append(
			this.$loading,
			this.$wrapper
		);
};

/**
 * Respond to setToken event from the model.
 * Update the data, set the proper location for the popup and show the popup.
 *
 * @param  {string} state Loading state; 'pending', 'success', or 'failure'
 * @param  {jQuery} $target The jQuery element representing the token in the DOM
 * @param  {Object} [data={}] Revision data for the current token
 */
RevisionPopupWidget.prototype.onModelSetToken = function ( state, $target, data = {} ) {
	this.$wrapper.toggleClass(
		'wwt-revisionPopupWidget-animate-visible',
		state !== 'pending'
	);
	this.$loading.toggle( state === 'pending' );
	this.$animated.toggle( state !== 'pending' );

	this.updateData( data || {} );
	this.setFloatableContainer( $target );
	this.toggle( true );
};

/**
 * Update popup data
 *
 * @param  {Object} [data={}] Data object
 */
RevisionPopupWidget.prototype.updateData = function ( data = {} ) {
	const dateStr = moment( data.revisionTime ).locale(
			mw.config.get( 'wgUserLanguage' )
		).format( 'LLL' ),
		$diffLink = $( '<a>' )
			.attr( 'href', mw.util.getUrl( `Special:Diff/${data.revisionId}` ) )
			.text( dateStr ),
		scoreMsgKey = Number( data.score ) >= 1 ?
			'whowrotethat-revision-attribution' :
			'whowrotethat-revision-attribution-lessthan',
		// i18n message keys for the bolded percentages are:
		//  - whowrotethat-revision-attribution-percent
		//  - whowrotethat-revision-attribution-lessthan-percent
		$scorePercent = $( '<strong>' ).text( mw.msg( scoreMsgKey + '-percent', data.score ) );

	// Comment content
	this.commentLabel.setLabel(
		new OO.ui.HtmlSnippet(
			data.comment === undefined ?
				$( '<span>' )
					.addClass( 'history-deleted' )
					// Note we can't use the native MediaWiki 'revdelete-summary-hid'
					// message because it can include parser functions.
					.text( mw.msg( 'whowrotethat-revision-edit-summary-hidden' ) ) :
				Tools.bidiIsolate( $.parseHTML( data.comment ) )
		)
	);

	this.commentLabel.$element
		.toggleClass( 'comment', !!data.comment )
		.toggleClass( 'comment--without-parentheses', !!data.comment );

	// Diff size
	this.diffSizeLabel.$element
		.toggleClass( 'mw-plusminus-pos', data.size > 0 )
		.toggleClass( 'mw-plusminus-neg', data.size < 0 )
		.toggleClass( 'mw-plusminus-null', data.size === 0 );
	this.diffSizeLabel.setLabel(
		data.size === undefined ? '' :
			new OO.ui.HtmlSnippet(
				Tools.bidiIsolate( `${data.size > 0 ? '+' : ''}${mw.language.convertNumber( data.size )}` )
			)
	);

	this.revisionAddedLabel.setLabel(
		new OO.ui.HtmlSnippet( mw.message(
			'whowrotethat-revision-added',
			getUserLinks( data ),
			$diffLink
		).parse() )
	);

	this.scoreLabel.setLabel(
		new OO.ui.HtmlSnippet( Tools.i18nHtml( scoreMsgKey, $scorePercent ) )
	);

	// Make sure all links in the popup (including in the edit summary) open in new tabs.
	this.$content.find( 'a' )
		.attr( 'target', '_blank' );
};

export default RevisionPopupWidget;

import Tools from './Tools';

/**
 * @class
 * @constructor
 * @param {Object} [config={}] Configuration options
 */
const RevisionPopupWidget = function RevisionPopupWidget( config = {} ) {
	this.$popupContent = $( '<div>' )
		.addClass( 'wwt-revisionPopupWidget-content' );
	// Parent constructor
	RevisionPopupWidget.parent.call( this, Object.assign(
		{
			padded: true,
			autoClose: true,
			position: 'above',
			// FIXME: 'force-left' for RTL languages
			align: 'force-right',
			hideWhenOutOfView: false,
			$content: this.$popupContent
		},
		config
	) );
};

/* Setup */
OO.inheritClass( RevisionPopupWidget, OO.ui.PopupWidget );

/**
 * Get markup for the diff size.
 * @param {number} size
 * @return {jQuery}
 */
function getSizeContent( size ) {
	const $diffBytes = $( '<span>' );
	$diffBytes.addClass( 'mw-diff-bytes' );

	// Guard against no size being specified.
	if ( size === undefined ) {
		return;
	}

	let sizeClass;
	if ( size > 0 ) {
		sizeClass = 'mw-plusminus-pos';
	} else if ( size < 0 ) {
		sizeClass = 'mw-plusminus-neg';
	} else {
		sizeClass = 'mw-plusminus-null';
	}
	return $diffBytes
		.addClass( sizeClass )
		.append( Tools.bidiIsolate( `${size > 0 ? '+' : ''}${mw.language.convertNumber( size )}` ) );
}

/**
 * Get inline markup for the edit summary and size difference. If there is an edit summary, the
 * returned HTML will start with a <br>; if there is no summary, it wont (so it can be appended to
 * the revision author information).
 * @param {Object} data As returned by Api.prototype.getTokenInfo().
 * @return {jQuery}
 */
function getCommentContent( data ) {
	const $revCommentSpan = $( '<span>' )
		.addClass( 'wwt-revisionPopupWidget-comment' )
		.append( $( '<span>' ).text( ' ' ), getSizeContent( data.size ) );

	if ( data.comment !== '' ) {
		const $commentSpan = $( '<span>' )
			.addClass( 'comment comment--without-parentheses' )
			.append( Tools.bidiIsolate( $.parseHTML( data.comment ) ) );
		$revCommentSpan.prepend( $( '<br>' ), $commentSpan );
	}
	return $revCommentSpan;
}

/**
 * Get jQuery objects for the user links.
 * @param {Object} data As returned by Api.prototype.getTokenInfo().
 * @return {jQuery}
 */
function getUserLinksContent( data ) {
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
 * Get content for the loading state.
 * @return {jQuery}
 */
function getLoadingStateContent() {
	const $shimmerSpan = $( '<span>' )
		.addClass( 'wwt-shimmer wwt-shimmer-animation' );
	return $( '<div>' )
		.append( $shimmerSpan, $shimmerSpan.clone(), $shimmerSpan.clone() );
}

/**
 * Get content for the popup, called once data has been retrieved from the API.
 * @param {Object} data
 * @return {jQuery}
 */
function getContent( data ) {
	const $userLinks = getUserLinksContent( data ),
		dateStr = moment( data.revisionTime ).locale( mw.config.get( 'wgUserLanguage' ) ).format( 'LLL' ),
		// Use jQuery to make sure attributes are properly escaped
		$diffLink = $( '<a>' )
			.attr( 'href', mw.util.getUrl( `Special:Diff/${data.revisionId}` ) )
			.text( dateStr ),
		addedMsg = mw.message( 'whowrotethat-revision-added', $userLinks, $diffLink ).parse(),
		scoreMsgKey = Number( data.score ) >= 1 ? 'whowrotethat-revision-attribution' : 'whowrotethat-revision-attribution-lessthan',
		// i18n message keys for the bolded percentages are:
		//  - whowrotethat-revision-attribution-percent
		//  - whowrotethat-revision-attribution-lessthan-percent
		$scorePercent = $( '<strong>' ).text( mw.msg( scoreMsgKey + '-percent', data.score ) ),
		$attributionMsg = $( '<div>' )
			.addClass( 'wwt-revisionPopupWidget-attribution' )
			.html( Tools.i18nHtml( scoreMsgKey, $scorePercent ) );

	return $( '<div>' )
		.append( addedMsg, getCommentContent( data ), $attributionMsg );
}

/**
 * Show the revision popup based on the given token data, above the given element.
 * Note that the English namespaces will normalize to the wiki's local namespaces.
 * @param {Object} data As returned by Api.prototype.getTokenInfo().
 * @param {jQuery} $target Element the popup should be attached to.
 * @param {boolean} [isCached] Whether the comment promise is available, cached.
 */
RevisionPopupWidget.prototype.show = function ( data, $target, isCached ) {
	let $content;

	// If data.comment is undefined, we are in the loading state.
	if ( data.comment === undefined ) {
		$content = getLoadingStateContent();
	} else {
		$content = getContent( data );

		if ( !isCached ) {
			$content.addClass( 'wwt-revisionPopupWidget-animate' );
		}
	}

	this.$popupContent.empty().append( $content );

	// Ensure the popup is attached to the visible content,
	// which it otherwise wouldn't be for image thumbnails.
	if ( $target.find( '.thumb' ).length ) {
		$target = $target.find( '.thumb' );
	}

	// Make sure all links in the popup (including in the edit summary) open in new tabs.
	this.$popupContent.find( 'a' )
		.attr( 'target', '_blank' );

	this.setFloatableContainer( $target );
	this.toggle( true );

	// Animate content once loaded.
	$( '.wwt-revisionPopupWidget-animate' )
		.addClass( 'wwt-revisionPopupWidget-animate-visible' );
};

export default RevisionPopupWidget;

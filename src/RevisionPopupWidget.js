import Tools from './Tools';

/**
 * @class
 * @constructor
 */
const RevisionPopupWidget = function RevisionPopupWidget() {
	this.$popupContent = $( '<div>' )
		.addClass( 'wwt-revisionPopupWidget-content' );
	// Parent constructor
	RevisionPopupWidget.parent.call( this, {
		padded: true,
		autoClose: true,
		position: 'above',
		// FIXME: 'force-left' for RTL languages
		align: 'force-right',
		hideWhenOutOfView: false,
		$content: this.$popupContent
	} );
};

/* Setup */
OO.inheritClass( RevisionPopupWidget, OO.ui.PopupWidget );

/**
 * Get markup for the diff size.
 * @param {number} size
 * @return {jQuery}
 */
function getSizeHtml( size ) {
	const $diffBytes = $( '<span>' );
	$diffBytes.addClass( 'mw-diff-bytes' );

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
		.text( `${size > 0 ? '+' : ''}${mw.language.convertNumber( size )}` );
}

/**
 * Get markup for the edit summary.
 * @param {Object} data As returned by Api.prototype.getTokenInfo().
 * @return {jQuery|null}
 */
function getCommentHtml( data ) {
	const $revCommentDiv = $( '<div>' )
		.addClass( 'wwt-revisionPopupWidget-comment' );

	if ( data.comment === '' ) {
		// No edit summary.
		return null;
	} else if ( data.comment === undefined ) {
		// Not yet available.
		const $shimmerDiv = $( '<div>' )
			.addClass( 'wwt-shimmer www-shimmer-animation' );
		$revCommentDiv.append( $shimmerDiv, $shimmerDiv );
	} else {
		const $commentSpan = $( '<span>' )
			.addClass( 'comment comment--without-parentheses wwt-revisionPopupWidget-comment' )
			.append( Tools.bidiIsolate( $.parseHTML( data.comment ) ) );
		$revCommentDiv
			.addClass( 'wwt-revisionPopupWidget-comment-transparent' )
			.append( $commentSpan, getSizeHtml( data.size ) );
	}
	return $revCommentDiv;
}

/**
 * Get jQuery objects for the user links.
 * @param {Object} data As returned by Api.prototype.getTokenInfo().
 * @return {jQuery}
 */
function getUserLinksHtml( data ) {
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
 * Show the revision popup based on the given token data, above the given element.
 * Note that the English namespaces will normalize to the wiki's local namespaces.
 * @param {Object} data As returned by Api.prototype.getTokenInfo().
 * @param {jQuery} $target Element the popup should be attached to.
 */
RevisionPopupWidget.prototype.show = function ( data, $target ) {
	const $userLinks = getUserLinksHtml( data ),
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
			.html( Tools.i18nHtml( scoreMsgKey, $scorePercent ) ),
		$html = $( '<div>' )
			.append( addedMsg, getCommentHtml( data ), $attributionMsg );
	this.$popupContent.empty().append( $html );

	if ( $target.find( '.thumb' ).length ) {
		$target = $target.find( '.thumb' );
	}

	// Make sure all links in the popup (including in the edit summary) open in new tabs.
	this.$popupContent.find( 'a' )
		.attr( 'target', '_blank' );

	this.setFloatableContainer( $target );
	this.toggle( true );

	// Animate edit summary, if present.
	if ( data.comment ) {
		$( '.wwt-revisionPopupWidget-comment' ).removeClass( 'wwt-revisionPopupWidget-comment-transparent' );
	}
};

export default RevisionPopupWidget;

/**
 * @class
 * @constructor
 */
const RevisionPopupWidget = function RevisionPopupWidget() {
	// Parent constructor
	RevisionPopupWidget.parent.call( this, {
		padded: true,
		autoClose: true,
		position: 'above',
		// FIXME: 'force-left' for RTL languages
		align: 'force-right',
		hideWhenOutOfView: false,
		$content: $( '<div>' )
			.addClass( 'ext-wwt-revisionPopupWidget-content' )
	} );
};

/* Setup */
OO.inheritClass( RevisionPopupWidget, OO.ui.PopupWidget );

function getSizeHtml( size ) {
	let sizeClass;

	if ( size > 0 ) {
		sizeClass = 'mw-plusminus-pos';
	} else if ( size < 0 ) {
		sizeClass = 'mw-plusminus-neg';
	} else {
		sizeClass = 'mw-plusminus-null';
	}

	return `
		<span class="${sizeClass} mw-diff-bytes">` +
			`${size > 0 ? '+' : ''}${mw.language.convertNumber( size )}` +
		'</span>';
}

/**
 * Show the revision popup based on the given token data, above the given element.
 * Note that the English namespaces will normalize to the wiki's local namespaces.
 * @param {Object} data As returned by Api.getTokenInfo().
 * @param {jQuery} $target Element the popup should be attached to.
 */
RevisionPopupWidget.prototype.show = function ( data, $target ) {
	const isIP = data.username.slice( 0, 2 ) === '0|',
		username = isIP ? data.username.slice( 2 ) : data.username,
		contribsUrl = mw.util.getUrl( `Special:Contributions/${username}` ),
		// We typically link to Special:Contribs for IPs.
		userPageUrl = isIP ? contribsUrl : mw.util.getUrl( `User:${data.username}` ),
		userLinks = `
			<a target="_blank" href="${userPageUrl}">${username}</a>
			${mw.msg( 'parentheses-start' )}<a target="_blank" href="${mw.util.getUrl( `User talk:${username}` )}">${mw.msg( 'talkpagelinktext' )}</a>
			${mw.msg( 'pipe-separator' )}
			<a target="_blank" href="${contribsUrl}">${mw.msg( 'contribslink' )}</a>${mw.msg( 'parentheses-end' )}
		`,
		dateStr = moment( data.revisionTime ).locale( mw.config.get( 'wgUserLanguage' ) ).format( 'LLL' ),
		diffLink = `<a target="_blank" href="${mw.util.getUrl( `Special:Diff/${data.revisionId}` )}">${dateStr}</a>`,
		addedMsg = mw.message( 'ext-whowrotethat-revision-added', userLinks, diffLink ).parse(),
		commentMsg = data.comment ? `<span class="comment comment--without-parentheses ext-wwt-revisionPopupWidget-comment">${data.comment}</span>` : '',
		sizeMsg = data.size ? getSizeHtml( data.size ) : '',
		attributionMsg = `<div class="ext-wwt-revisionPopupWidget-attribution">${mw.message( 'ext-whowrotethat-revision-attribution', data.score ).parse()}</div>`,
		html = $.parseHTML( `${addedMsg.trim()} ${commentMsg}${sizeMsg} ${attributionMsg}` );

	$( '.ext-wwt-revisionPopupWidget-content' ).html( html );
	this.setFloatableContainer( $target );
	this.toggle( true );
};

export default RevisionPopupWidget;

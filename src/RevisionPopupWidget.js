import Tools from './Tools';

/**
 * @class
 * @constructor
 */
const RevisionPopupWidget = function RevisionPopupWidget() {
	this.$popupContent = $( '<div>' )
		.addClass( 'ext-wwt-revisionPopupWidget-content' );
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
	const contribsUrl = mw.util.getUrl( `Special:Contributions/${data.username}` ),
		// We typically link to Special:Contribs for IPs.
		userPageUrl = data.isIP ? contribsUrl : mw.util.getUrl( `User:${data.username}` ),
		// Create links using the jQuery objects so they're properly escaped
		$userLinks = $( [] )
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
			.add( document.createTextNode( mw.msg( 'parentheses-end' ) ) ),
		dateStr = moment( data.revisionTime ).locale( mw.config.get( 'wgUserLanguage' ) ).format( 'LLL' ),
		// Use jQuery to make sure attributes are properly escaped
		$diffLink = $( '<a>' )
			.attr( 'href', mw.util.getUrl( `Special:Diff/${data.revisionId}` ) )
			.text( dateStr ),
		addedMsg = mw.message( 'ext-whowrotethat-revision-added', $userLinks, $diffLink ).parse(),
		commentMsg = data.comment ?
			`<span class="comment comment--without-parentheses ext-wwt-revisionPopupWidget-comment">${Tools.bidiIsolate( $.parseHTML( data.comment ), true )}</span>` :
			'',
		sizeMsg = data.size ? getSizeHtml( data.size ) : '',
		attributionMsg = `<div class="ext-wwt-revisionPopupWidget-attribution">${mw.message( 'ext-whowrotethat-revision-attribution', data.score ).parse()}</div>`,
		html = `${addedMsg.trim()} ${commentMsg}${sizeMsg} ${attributionMsg}`;

	this.$popupContent.html( html );

	if ( $target.find( '.thumb' ).length ) {
		$target = $target.find( '.thumb' );
	}

	// Make sure all links in the popup (including in the edit summary) open in new tabs.
	this.$popupContent.find( 'a' )
		.attr( 'target', '_blank' );

	this.setFloatableContainer( $target );
	this.toggle( true );
};

export default RevisionPopupWidget;

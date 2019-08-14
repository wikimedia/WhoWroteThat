import config from './config';
import Api from './Api';
import InfoBarWidget from './InfoBarWidget';
let components = $( 'body' ).data( 'wwt-components' );

// Initialize
if ( !components ) {
	// Store, so we don't append and create objects if they've been created
	// TODO: We could potentially store all that data in some view model that's shared
	// across the widgets.
	components = {
		widget: new InfoBarWidget(),
		api: new Api( { url: config.wikiWhoUrl } ),
		$originalOutput: $( 'body' ).data( 'wwt-originalOutput' )
	};

	$( 'body' ).data( 'wwt-components', components );

	if ( $( 'body' ).hasClass( 'skin-timeless' ) ) {
		$( '#mw-content-wrapper' ).prepend( components.widget.$element );
	} else {
		$( '#content' ).prepend( components.widget.$element );
	}
}

components.widget.toggle( true );
components.widget.setState( 'pending' );
components.api.getData( window.location.href )
	.then(
		// Success handler.
		function () {
			const api = components.api;
			// Insert modified HTML.
			$( '.mw-parser-output' ).html( api.getReplacementHtml() );
			// Highlight when hover a user's contributions.
			// @TODO This is just testing code and should be replaced by the proper behaviour.
			$( '.mw-parser-output .editor-token' )
				.on( 'mouseenter', function () {
					const ids = api.getIdsFromElement( this );
					// Activate all this user's contribution spans.
					$( '.token-editor-' + ids.editorId ).addClass( 'active' );
					// Information for popup.
					// eslint-disable-next-line no-console
					console.log( api.getTokenInfo( ids.tokenId ) );
				} )
				.on( 'mouseleave', function () {
					// Deactivate all spans.
					$( '.mw-parser-output .editor-token' ).removeClass( 'active' );
				} );
			components.widget.setState( 'ready' );
		},
		// Error handler.
		function ( errorCode ) {
			components.widget.setState( 'err' );
			components.widget.setErrorMessage( errorCode );
		}
	);
components.widget.on( 'close', () => {
	// Close button; revert back to the original content
	// $( '.mw-parser-output' ).empty().append( components.$originalOutput );
	// Hide the widget
	components.widget.toggle( false );
} );

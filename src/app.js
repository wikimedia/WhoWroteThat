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
components.widget.on( 'close', () => {
	// Close button; revert back to the original content
	// $( '.mw-parser-output' ).empty().append( components.$originalOutput );
	// Hide the widget
	components.widget.toggle( false );
} );

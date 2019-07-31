( function () {
	QUnit.module( 'Api' );

	QUnit.test( 'getQueryParameter', function ( assert ) {
		var api = new extwrt.Api();
		assert.strictEqual( api.getQueryParameter( '?foo=bar', 'foo' ), 'bar' );
	} );

	QUnit.test( 'getAjaxURL', function ( assert ) {
		var api = new extwrt.Api( { url: 'https://wikicolor.example.com/' } );
		assert.strictEqual(
			api.getAjaxURL( 'https://en.wikipedia.org/wiki/Foo' ),
			'https://wikicolor.example.com/en/whocolor/v1.0.0-beta/Foo/'
		);
		assert.strictEqual(
			api.getAjaxURL( 'https://en.wikipedia.org/w/index.php?title=Foo' ),
			'https://wikicolor.example.com/en/whocolor/v1.0.0-beta/Foo/'
		);
		assert.strictEqual(
			api.getAjaxURL( 'https://ru.wikipedia.org/w/index.php?title=Foo&oldid=123' ),
			'https://wikicolor.example.com/ru/whocolor/v1.0.0-beta/Foo/123/'
		);
	} );
}() );

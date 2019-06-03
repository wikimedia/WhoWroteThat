const assert = require('assert'),
	Retriever = require('../src/Retriever.js');

describe( 'Retriever', () => {
	var ret = new Retriever();

	it( 'Reads the URL correctly', () => {
		assert.equal(
			ret.getUrlParameter( '?who=foo&what=bar', 'who' ),
			'foo'
		);
	} );

} );

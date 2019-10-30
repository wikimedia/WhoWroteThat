import { expect } from 'chai';
import Tools from '../../src/Tools';

describe( 'Tools test', () => {
	describe( 'Tools.bidiIsolate', () => {
		const cases = [
			{
				input: 'foo',
				expected: '<bdi>foo</bdi>',
				msg: 'Simple string'
			},
			{
				input: 'foo with some spaces',
				expected: '<bdi>foo with some spaces</bdi>',
				msg: 'String with spaces'
			},
			{
				input: $.parseHTML( '<a href="http://example.com">wrapped link as raw HTML</a>' ),
				expected: '<bdi><a href="http://example.com">wrapped link as raw HTML</a></bdi>',
				msg: 'Accepts parsed HTML.'
			},
			{
				input: $( '<a>' )
					.prop( 'href', 'http://example.com' )
					.text( 'foo bar baz' ),
				expected: '<bdi><a href="http://example.com">foo bar baz</a></bdi>',
				msg: 'jQuery element'
			}
		];

		cases.forEach( testCase => {
			it( testCase.msg, () => {
				expect( Tools.bidiIsolate( testCase.input )[ 0 ].outerHTML )
					.to.equal( testCase.expected );
			} );
		} );
	} );
} );

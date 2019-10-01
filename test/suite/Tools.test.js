import { expect } from 'chai';
import Tools from '../../src/Tools';
const $ = require( 'jquery' );

describe( 'Tools test', () => {
	describe( 'Tools.bidiIsolate', () => {
		const cases = [
			{
				input: 'foo',
				raw: true,
				expected: '<bdi>foo</bdi>',
				msg: 'Simple string'
			},
			{
				input: 'foo with some spaces',
				raw: true,
				expected: '<bdi>foo with some spaces</bdi>',
				msg: 'String with spaces'
			},
			{
				input: '<a href="http://example.com/something?action=bar">a wrapped link</a>',
				raw: true,
				expected: '<bdi>&lt;a href="http://example.com/something?action=bar"&gt;a wrapped link&lt;/a&gt;</bdi>',
				msg: 'Raw string gets escaped'
			},
			{
				input: $( '<a>' )
					.prop( 'href', 'http://example.com' )
					.text( 'foo bar baz' ),
				raw: true,
				expected: '<bdi><a href="http://example.com">foo bar baz</a></bdi>',
				msg: 'jQuery element'
			}
		];

		cases.forEach( testCase => {
			it( testCase.msg, () => {
				expect( Tools.bidiIsolate( testCase.input, testCase.raw ) )
					.to.equal( testCase.expected );
			} );
		} );
	} );
} );

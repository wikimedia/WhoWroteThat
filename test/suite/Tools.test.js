import { expect } from 'chai';
import Tools from '../../src/Tools.js';

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

		cases.forEach( ( testCase ) => {
			it( testCase.msg, () => {
				expect( Tools.bidiIsolate( testCase.input )[ 0 ].outerHTML )
					.to.equal( testCase.expected );
			} );
		} );
	} );

	describe( 'Tools.i18nHtml', () => {
		const cases = [
			{
				testName: 'No parameters.',
				msg: 'test-msg1',
				msgVal: 'Test message.',
				params: [],
				out: 'Test message.'
			},
			{
				testName: 'One parameter.',
				msg: 'test-msg2',
				msgVal: 'Test $1 message.',
				params: [ $( '<span>' ).text( 'HTML' ) ],
				out: 'Test <span>HTML</span> message.'
			},
			{
				testName: 'Two parameters.',
				msg: 'test-msg3',
				msgVal: 'Test $1 message $2.',
				params: [
					$( '<span>' ).text( 'HTML' ),
					$( '<span>' ).attr( 'id', 'second' ).text( 'second' )
				],
				out: 'Test <span>HTML</span> message <span id="second">second</span>.'
			},
			{
				testName: 'Parameters of different types, with HTML in the string.',
				msg: 'test-msg4',
				msgVal: 'String $1 jQuery $2',
				params: [ 'lorem <script>bad</script>', $( '<span>' ).text( 'ipsum' ) ],
				out: 'String lorem &lt;script&gt;bad&lt;/script&gt; jQuery <span>ipsum</span>'
			}
		];
		cases.forEach( ( testCase ) => {
			global.mw = {
				/**
				 * Stub for MediaWiki's msg function.
				 *
				 * @param {string} msg
				 * @param {any} params
				 * @return {string}
				 */
				msg: ( msg, ...params ) => {
					let out = testCase.msgVal;
					params.forEach( function ( param, idx ) {
						out = out.replace( '$' + ( idx + 1 ), param );
					} );
					return out;
				}
			};
			expect( Tools.i18nHtml.apply( null, [ testCase.msg ].concat( testCase.params ) ) )
				.to.equal( testCase.out );
		} );
	} );
} );

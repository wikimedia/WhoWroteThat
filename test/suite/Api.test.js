import { expect } from 'chai';
import Api from '../../src/Api';

describe( 'Api test', () => {
	describe( 'getQueryParameter', () => {
		it( 'Should get a simple parameter', () => {
			const a = new Api();
			expect( a.getQueryParameter( '?foo=bar', 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'Should get a simple parameter among some', () => {
			const a = new Api();
			expect( a.getQueryParameter( '?foo=bar&baz=quuz', 'baz' ) ).to.equal( 'quuz' );
		} );
	} );

	describe( 'getAjaxURL', () => {
		const cases = [
			{
				msg: 'Should get the correct API URL',
				input: 'https://en.wikipedia.org/wiki/Foo',
				expected: 'https://wikiwho.example.com/en/whocolor/v1.0.0-beta/Foo/'
			},
			{
				msg: 'Should get the correct API URL without fragment',
				input: 'https://en.wikipedia.org/wiki/Foo#section',
				expected: 'https://wikiwho.example.com/en/whocolor/v1.0.0-beta/Foo/'
			},
			{
				msg: 'Should get the correct API URL without query string',
				input: 'https://en.wikipedia.org/wiki/Iñtërnâtiônàlizætiøn_(disambig)?debug=1',
				expected: 'https://wikiwho.example.com/en/whocolor/v1.0.0-beta/Iñtërnâtiônàlizætiøn_(disambig)/'
			},
			{
				msg: 'Should get the correct API URL from title parameter',
				input: 'https://en.wikipedia.org/w/index.php?title=Foo',
				expected: 'https://wikiwho.example.com/en/whocolor/v1.0.0-beta/Foo/'
			},
			{
				msg: 'Should get the correct API URL with oldid parameter',
				input: 'https://ru.wikipedia.org/w/index.php?title=Foo&oldid=123',
				expected: 'https://wikiwho.example.com/ru/whocolor/v1.0.0-beta/Foo/123/'
			}
		];

		// Run all test cases
		cases.forEach( testCase => {
			const a = new Api( { url: 'https://wikiwho.example.com/' } );
			it( testCase.msg, () => {
				expect( a.getAjaxURL( testCase.input ) ).to.equal( testCase.expected );
			} );
		} );
	} );
} );

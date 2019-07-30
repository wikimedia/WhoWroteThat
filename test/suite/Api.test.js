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
				msg: 'Should get the correct API url',
				input: 'https://en.wikipedia.org/wiki/Foo',
				expected: 'https://wikicolor.example.com/en/whocolor/v1.0.0-beta/Foo/'
			},
			{
				msg: 'Should get the correct API url from url parameter',
				input: 'https://en.wikipedia.org/w/index.php?title=Foo',
				expected: 'https://wikicolor.example.com/en/whocolor/v1.0.0-beta/Foo/'
			},
			{
				msg: 'Should get the correct API url with oldid parameter',
				input: 'https://ru.wikipedia.org/w/index.php?title=Foo&oldid=123',
				expected: 'https://wikicolor.example.com/ru/whocolor/v1.0.0-beta/Foo/123/'
			}
		];

		// Run all test cases
		cases.forEach( ( testCase ) => {
			const a = new Api( { url: 'https://wikicolor.example.com/' } );
			it( testCase.msg, () => {
				expect( a.getAjaxURL( testCase.input ) ).to.equal( testCase.expected );
			} );
		} );
	} );
} );

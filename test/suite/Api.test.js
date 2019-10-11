import { expect } from 'chai';
import Api from '../../src/Api';

describe( 'Api test', () => {

	describe( 'getAjaxURL', () => {
		const cases = [
			{
				msg: 'Should get the correct API URL',
				config: {
					wgServerName: 'en.wikipedia.org',
					wgPageName: 'Iñtërnâtiônàlizætiøn_(disambig)'
				},
				expected: 'https://wikiwho.example.com/en/whocolor/v1.0.0-beta/Iñtërnâtiônàlizætiøn_(disambig)/'
			},
			{
				msg: 'Should only append a revision ID if it is not the current one',
				config: {
					wgServerName: 'cbk-zam.wikipedia.org',
					wgPageName: 'Foo',
					wgRevisionId: 123,
					wgCurRevisionId: 123
				},
				expected: 'https://wikiwho.example.com/cbk-zam/whocolor/v1.0.0-beta/Foo/'
			},
			{
				msg: 'Should get the correct API URL with an old revision ID',
				config: {
					wgServerName: 'ru.wikipedia.org',
					wgPageName: 'Foo',
					wgRevisionId: 123,
					wgCurRevisionId: 456
				},
				expected: 'https://wikiwho.example.com/ru/whocolor/v1.0.0-beta/Foo/123/'
			}
		];

		// Run all test cases
		cases.forEach( testCase => {
			// Dummy version of mw.Map to use as config.
			const config = {
					data: testCase.config,
					/**
					 * Mock an mw.Map getter for use in the config
					 *
					 * @param  {string} key Name of the key to fetch
					 * @return {string|number} Value
					 */
					get: function ( key ) {
						return this.data[ key ];
					}
				},
				a = new Api( { url: 'https://wikiwho.example.com/', mwConfig: config } );
			it( testCase.msg, () => {
				expect( a.getAjaxURL() ).to.equal( testCase.expected );
			} );
		} );
	} );
} );

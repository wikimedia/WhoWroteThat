import { expect } from 'chai';
import activationInstance from '../../src/ActivationSingleton';
const $ = require( 'jquery' );

describe( 'ActivationSingleton test', () => {
	describe( 'getOriginalContent and getContentWrapper', () => {
		const $someContent = $( '<div>' )
			.append(
				$( '<span>' ).text( 'This is the original DOM structure' )
			);

		activationInstance.initialize(
			$someContent,
			{
				namespace: '',
				mainPage: false
			}
		);
		activationInstance.setOriginalContent( $someContent );

		// Change the content
		$someContent.empty().append(
			$( '<a>' ).text( 'A link instead' )
		);

		it( 'getContentWrapper returns changed/updated content', () => {
			expect( activationInstance.getContentWrapper().html() )
				.to.equal( '<a>A link instead</a>' );
		} );
		it( 'getOriginalContent returns original content', () => {
			expect( activationInstance.getOriginalContent().html() )
				.to.equal( '<span>This is the original DOM structure</span>' );
		} );

	} );

	describe( 'isValidPage', () => {
		const cases = [
			{
				msg: 'Valid: Regular article',
				$content: $( '<div>' ).text( 'foobar' ),
				config: {
					namespace: '',
					mainPage: false
				},
				expected: true
			},
			{
				msg: 'Invalid: Special page',
				$content: $( '<div>' ).text( 'foobar' ),
				config: {
					namespace: 'Special',
					mainPage: false
				},
				expected: false
			},
			{
				msg: 'Invalid: Main page',
				$content: $( '<div>' ).text( 'foobar' ),
				config: {
					namespace: '',
					mainPage: true
				},
				expected: false
			},
			{
				msg: 'Invalid: Parser output does not exist',
				$content: $(),
				config: {
					namespace: '',
					mainPage: false
				},
				expected: false
			}
		];

		cases.forEach( testCase => {
			it( testCase.msg, () => {
				activationInstance.setProperties(
					testCase.$content,
					testCase.config
				);

				expect( activationInstance.isValidPage() )
					.to.equal( testCase.expected );
			} );
		} );
	} );
} );

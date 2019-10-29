import { expect } from 'chai';
import Model from '../../src/Model';
const $ = require( 'jquery' );

describe( 'Model test', () => {
	describe( 'Events', () => {
		const m = new Model(),
			result = [],
			expected = [
				'state:ready|',
				'active:true',
				'active:false',
				'enabled:true',
				'state:err|refresh'
			];

		m.on( 'initialized', () => result.push( 'initialized' ) );
		m.on( 'active', () => result.push( 'active:' + m.isActive() ) );
		m.on( 'enabled', () => result.push( 'enabled:' + m.isEnabled() ) );
		m.on( 'state', ( state, errorCode ) => result.push(
			'state:' + m.getState() + '|' + errorCode
		) );

		// Trigger events
		m.setState( 'pending' ); // No event; this is the initial state
		m.setState( 'ready' );
		m.toggleActive( true );
		m.toggleActive();
		m.toggleEnabled( false ); // No event; this is the initial state
		m.toggleEnabled( true );
		m.toggleEnabled();
		m.setState( 'err', 'refresh' );

		it( 'Emits events', () => {
			expect( result ).to.deep.equal( expected );
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
			const m = new Model();

			it( testCase.msg, () => {
				m.initialize(
					testCase.$content,
					testCase.config
				);

				expect( m.isValidPage() )
					.to.equal( testCase.expected );
			} );
		} );
	} );

	describe( 'cacheOriginal and getContentWrapper', () => {
		const m = new Model(),
			$someContent = $( '<div>' )
				.append(
					$( '<span>' ).text( 'This is the original DOM structure' )
				);

		m.initialize(
			$someContent,
			{
				namespace: '',
				mainPage: false
			}
		);
		m.cacheOriginal();

		// Change the content
		$someContent.empty().append(
			$( '<a>' ).text( 'A link instead' )
		);

		it( 'getContentWrapper returns changed/updated content', () => {
			// Content wrapper includes the entire wrapper + content
			expect( m.getContentWrapper()[ 0 ].outerHTML )
				.to.equal( '<div><a>A link instead</a></div>' );
		} );
		it( 'getOriginalContent returns original content', () => {
			// Original content includes only the content that was originally
			// there inside the wrapper
			expect( m.getOriginalContent()[ 0 ].outerHTML )
				.to.equal( '<span>This is the original DOM structure</span>' );
		} );

		// Re-cache the original
		it( 'getOriginalContent returns the content that was re-cached', () => {
			m.cacheOriginal(
				$( '<div>' ).append( $( '<a>' ).text( 'A whole new other DOM' ) )
			);
			expect( m.getOriginalContent().html() )
				.to.equal( '<a>A whole new other DOM</a>' );
		} );
	} );
} );

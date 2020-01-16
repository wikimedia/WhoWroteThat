import { expect } from 'chai';
import wwtController from '../../src/Controller';

describe( 'wwtController test', () => {
	const $someContent = $( '<div>' )
		.append(
			$( '<span>' ).text( 'This is the original DOM structure' )
		);

	wwtController.initialize(
		$someContent,
		{
			namespace: '',
			mainPage: false
		}
	);

	/*
	TODO: Find a better way to test the system without having to
	load all the dependency chains with OOUI, etc.
	it( 'Controller launches the system.', done => {
		wwtController.launch().then( () => {
			expect( wwtController.getModel().isActive() ).to.be.true;
			done();
		} );
	} );

	it( 'Controller dismisses the system.', done => {
		wwtController.launch().then( () => {
			wwtController.dismiss();
			expect( wwtController.getModel().isActive() ).to.be.false;
			done();
		} );
	} );
	*/

	it( 'Controller cannot launch if system is disabled.', done => {
		wwtController.getModel().toggleEnabled( false );
		wwtController.launch().fail( () => {
			// Failure
			// eslint-disable-next-line no-unused-expressions
			expect( wwtController.getModel().isActive() ).to.be.false;
			done();
		} );
	} );
} );

class PageParser {
	getPageTitle() {
		return $( 'h1#firstHeading' ).text();
	}
}

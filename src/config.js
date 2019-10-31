const config = {
	wikiWhoUrl: 'https://www.wikiwho.net/',
	// Set the output type between the extension and the gadget
	outputEnvironment: '',
	// Elements that we know for sure are never tokenized and should be grayed out.
	untokenizedElements: [
		'.citation',
		'.IPA',
		'.mw-editsection',
		'table'
	]
};

// Set up a prefix for console outputs
config.outputPrefix = `Who Wrote That? (${config.outputEnvironment}): `;

export default config;

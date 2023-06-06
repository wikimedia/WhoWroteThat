const config = {
	wikiWhoUrl: 'https://wikiwho.wmcloud.org/',
	// Set the output type between the extension and the gadget
	outputEnvironment: '',
	// Elements that we know for sure are never tokenized and should be grayed out.
	untokenizedElements: [
		'.citation',
		'.IPA',
		'.mw-editsection'
	]
};

// Set up a prefix for console outputs
config.outputPrefix = `Who Wrote That? (${config.outputEnvironment}): `;

export default config;

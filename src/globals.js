// Define a variable that will be used throughout the code
// This isn't quite a global variable because it's only used
// inside the extension, but it is used as one through writing
// the individual files in /src, and will be used to store all
// the necessary objects and methods when the build step
// concatenates the files for the extension release.
var extwrt = { // eslint-disable-line no-unused-vars,no-implicit-globals
	ui: {},
	dm: {},
	globals: {
		wikicolorUrl: 'https://www.wikiwho.net/'
	}
};

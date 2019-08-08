# WhoWroteThat for Wikipedia browser extension

A browser extension (Chrome and Firefox) based on the https://github.com/wikiwho/WhoColor greasemonkey user script.

** UNDER CONSTRUCTION **

[![CircleCI](https://circleci.com/gh/wikimedia/WhoWroteThat.svg?style=svg)](https://circleci.com/gh/wikimedia/WhoWroteThat)

## Wikipedias
The extension works only on Wikipedias supported by WhoColor API:
* English Wikipedia: `*://en.wikipedia.org/*`
* German Wikipedia: `*://de.wikipedia.org/*`
* Basque Wikipedia: `*://eu.wikipedia.org/*`
* Turkish Wikipedia: `*://tr.wikipedia.org/*`
* Spanish Wikipedia: `*://es.wikipedia.org/*`

## Testing the Browser Extension
There's a Grunt job to output the code into a working browser extension. To test it:

1. Clone the repo
2. Run `npm install`
3. Run `grunt build`
4. Testing in Chrome: Go to `chrome://extensions/`, click on 'Load unpacked', and choose the `WhoWroteThat/dist/extension` directory. Enable the extension, and go to any article on en.wikipedia.org.
5. Testing in Firefox: [Follow the official instructions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Temporary_Installation_in_Firefox) to load `WhoWroteThat/dist/extension` directory as an unpacked addon. Enable, and go to any article on en.wikipedia.org.

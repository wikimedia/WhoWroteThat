# WhoWroteThis for Wikipedia browser extension

A browser extension (Chrome and Firefox) based on the https://github.com/wikiwho/WhoColor greasemonkey user script.

** UNDER CONSTRUCTION **

== Testing the Browser Extension ==
There's a Grunt job to output the code into a working browser extension. To test it:

1. Clone the repo
2. Run `npm install`
3. Run `grunt build`
4. Testing in Chrome: Go to `chrome://extensions/`, click on 'Load unpacked', and choose the `WhoWroteThat/extension` directory. Enable the extension, and go to any article on en.wikipedia.org.
5. Testing in Firefox: [Follow the official instructions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Temporary_Installation_in_Firefox) to load `WhoWroteThat/extension` directory as an unpacked addon. Enable, and go to any article on en.wikipedia.org.

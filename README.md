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
3. Run `npm run build`
4. Testing in Chrome: Go to `chrome://extensions/`, click on 'Load unpacked', and choose the `WhoWroteThat/dist/extension` directory. Enable the extension, and go to any article on en.wikipedia.org.
5. Testing in Firefox: [Follow the official instructions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Temporary_Installation_in_Firefox) to load `WhoWroteThat/dist/extension` directory as an unpacked addon. Enable, and go to any article on en.wikipedia.org. 

To install as a gadget, follow step 1-3 then refer to [the install.md file](./tutorials/install.md).

## Debugging

The extension and gadget expose a debugging namespace for testing purposes in `wwtDebug`. These commands can be run in the console and will work for both implementations (gadget and browser extension) on valid articles where the script loads.

Available commands are:

* `wwtDebug.resetWelcomePopup()`: Resets the value of the stored 'shown' state of the popup. This is useful in case the popup was dismissed (which means it will never appear again) and for testing purposes, we want to display it again. After confirmation in the console, the popup will be displayed on subsequent refresh of the page.

## API Proxy

To protect the privacy of our users, this tool routes all requests to the WhoColor API through a
[proxy](./public_html/wikiWhoProxy.php) that lives on Toolforge. Requests can only be made from
Wikipedias. Refer to https://api.wikiwho.net/ if you would like to test making requests to the APIs
directly.

The [.lighttpd.conf](./.lighttpd.conf) file and the [public_html](./public_html) directory are for
use only on Toolforge. To set up the Toolforge tool, checkout this repo in the home directory and
create `wikiwho.ini` with the `user` and `password` of the WikiWho account.

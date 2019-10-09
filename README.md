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

There's a Grunt job to output the code into both a working browser extension and gadget.

1. Clone the repo: `git clone https://github.com/wikimedia/whowrotethat.git`
2. Go into its directory: `cd whowrotethat`
2. Run `npm install`
3.
   * **Firefox:**
      1. Run `grunt run`
      2. This will open Firefox to a random page on English Wikipedia,
         and you should have the 'Who Wrote That?' link in the sidebar.
         See the [web-ext 'run' docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/web-ext_command_reference#web-ext_run)
         for details of how to customize this command with environment variables.
      3. If you want to [load the extension manually](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Temporary_Installation_in_Firefox),
         go to `about:debugging` and select the manifest file in `dist/extension/`.
   * **Chrome:**
      1. Run `grunt build`
      2. Go to `chrome://extensions/` in Chrome
      3. Click on 'Load unpacked', and choose the `WhoWroteThat/dist/extension` directory
      4. Enable the extension, and go to any article on en.wikipedia.org.
   * **Wikipedia gadget or userscript:**
      1. Run `grunt build`
      2. Refer to [the install.md file](./tutorials/install.md).

## Releasing the browser extension

After updating the version number in `package.json`
and tagging the release in Git,
run `grunt` (the default task only) to create
a zip file such as `dist/whowrotethat_for_wikipedia-0.2.0.0.zip`.
This can be uploaded to the Firefox and Chrome browser stores.

A second zip file is also produced, containing the source code.
This is required for submission to the Firefox add-ons store.

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

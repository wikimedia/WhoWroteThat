Who Wrote That? for Wikipedia
=============================

Explore authorship and revision information visually and directly in Wikipedia articles.
Powered by [WikiWho](https://f-squared.org/wikiwho/).

WhoWroteThat is available as a browser extension for Firefox and Chrome.

* [Homepage](https://www.mediawiki.org/wiki/WWT)
* [Project page](https://meta.wikimedia.org/wiki/Community_Tech/Who_Wrote_That_tool)
* [User interface translation](https://translatewiki.net/wiki/Translating:WhoWroteThat%3F)

[![License: MIT](https://img.shields.io/github/license/wikimedia/WhoWroteThat)](https://github.com/wikimedia/WhoWroteThat/blob/master/MIT-LICENSE)
[![CircleCI build status](https://img.shields.io/circleci/build/github/wikimedia/WhoWroteThat)](https://circleci.com/gh/wikimedia/WhoWroteThat)

Table of Contents:

* [Supported Wikipedias](#supported-wikipedias)
* Installation: [for users](#installation-for-users), [for developers](#installation-for-developers)
* [Releasing the browser extension](#releasing-the-browser-extension)
* [Debugging](#debugging)
* [API Proxy](#api-proxy)
* [Changelog](#changelog)

## Supported Wikipedias

The tool works on Wikipedias supported by the WhoColor API:
[English](https://en.wikipedia.org/),
[German](https://de.wikipedia.org/),
[Basque](https://eu.wikipedia.org/),
[Turkish](https://tr.wikipedia.org/), and
[Spanish](https://es.wikipedia.org/).

## Installation for users

1. Navigate to the extension's page for your browser:
   * [Firefox](https://addons.mozilla.org/en-US/firefox/addon/whowrotethat/)
   * [Chrome](https://chrome.google.com/webstore/detail/who-wrote-that/ekkbnedhfelfaidbpaedaecjiokkionn)
2. Click 'Add to Firefox' or 'Add to Chrome'.
3. You will be prompted to grant permission to install the extension. Do so.
4. After installation, when you go to any applicable Wikipedia article, there will be a new 'Who Wrote That?' link in the sidebar.

## Installation for developers

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
      4. Enable the extension, and go to any article on a supported Wikipedia.

## Releasing the browser extension

First update the version number in `package.json`
and ensure the changelog is up to date,
then tag the release in Git.
Run `grunt` (the default task only) to create
six zip files such as `dist/extension_firefox/whowrotethat_for_wikipedia-0.2.0.0.zip`
(three for beta and three for production; two for Chrome and four for Firefox).
These can be uploaded to the Firefox and Chrome browser stores.

Note that web extensions use four-digit version numbers,
but WWT only uses the first three
(the last is always zero; it's added by the Grunt task).

The `*_source.zip` files contain the source code,
for submission to the Firefox add-ons store (but not for Chrome).

Maintainers (i.e. any members of the [wmf-commtech Google Group](https://groups.google.com/forum/#!forum/wmf-commtech))
can upload releases via:
* https://addons.mozilla.org/en-US/developers/addon/whowrotethat/edit
* https://chrome.google.com/webstore/developer/edit/ekkbnedhfelfaidbpaedaecjiokkionn

### Firefox store localization

In addition to uploading the two zip files for a new release,
it's also necessary to check that the Firefox store (or [AMO](https://addons.mozilla.org/))
has the correct translations.

This is done with the `grunt checkListings` and `grunt checkListings:beta` commands.
These will report any discrepancies with the published names or descriptions of the extension,
which will need to be resolved manually (because there's no editing API for the browser store).

Localization is not required for Chrome,
because it reads all names and descriptions from the `_locales/` files.

## Debugging

The extension exposes a debugging namespace for testing purposes in `wwtDebug`.
These commands can be run in the console and will work on valid articles where the script loads.

Available commands are:

* `wwtDebug.resetWelcomePopup()`: Resets the value of the stored 'shown' state of the popup. This is useful in case the popup was dismissed (which means it will never appear again) and for testing purposes, we want to display it again. After confirmation in the console, the popup will be displayed on subsequent refresh of the page.

## API Proxy

To protect the privacy of our users, this tool routes all requests to the WhoColor API through a
proxy at [wikiwho.wmflabs.org](https://wikiwho.wmflabs.org/).
Requests can only be made from Wikipedias.
Refer to [api.wikiwho.net](https://api.wikiwho.net/) if you would like to test making requests to the APIs directly.
The proxy VPS is [documented on Wikitech](https://wikitech.wikimedia.org/wiki/Tool:CommTech#WikiWho).

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for an updated status and changes between releases.

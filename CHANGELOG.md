# Changelog
All notable changes to this project will be documented in this file.
Please see [README](README.md) for installation, testing, and contribution instructions.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.22.2] - 2024-08-07
### Changed
- Upgraded to manifest version 3.
- Translation updates.

## [0.22.1] - 2024-04-02
### Changed
- Translation updates.
### Fixed
- Fix issue with page titles containing question marks and other special characters.

## [0.22.0] - 2024-03-14
### Changed
- Added support for Arabic Wikipedia.

## [0.21.0] - 2024-02-28
### Fixed
- Fix compatibility with Vector 2022 and pages using status indicators.
### Changed
- Translation updates.

## [0.20.0] - 2023-10-30
### Changed
- Translation updates.

### Fixed
- Fix typo that loads messages when popup is requested
- Fix Vector 2022 sticky header overlapping info bar

## [0.19.0] - 2023-06-06
### Changed
- Added support for Hungarian, Indonesian, Japanese, Dutch, Polish and
  Portuguese Wikipedias.
- Update API URL to its new home at wmcloud.org
- Translation updates.

## [0.18.0] - 2023-04-28
### Changed
- Added support for Italian Wikipedia.
- Translation updates.

## [0.17.0] - 2023-04-26
### Changed
- Added support for French Wikipedia.
- Translation updates.

## [0.16.2] - 2022-09-14
### Changed
- Remove unused for_reference-greasemonkey_code.js file.
- Translation updates.

## [0.16.1] - 2022-07-29
### Fixed
- Handle pages that have multiple instances of .mw-parser-output

## [0.16.0] - 2022-06-06
### Changed
- Remove unused 'activeTab' permission.
- Fetch messages when popup is requested instead of when extension is loaded.
- Translation updates.
- Update Node dependencies.
### Fixed
- Minor styling fixes for narrow screen Vector.

## [0.15.4] - 2020-02-13
### Changed
- Translation updates.
### Fixed
- Add 'long description' message for use on browser stores

## [0.15.3] - 2020-02-06
### Changed
- Translation updates.

## [0.15.2] - 2020-01-28
### Added
- Firefox l10n documentation.
- Ensure attribution percentages don't wrap onto a new line.

### Changed
- Translation and documentation updates.

### Fixed
- Minor styling fixes to revision details popup.
- Installation documentation.

### Removed
- Outdated documentation about the WWT gadget.
- Unused 'tutorial' documentation (moved to the README).
- Remove redundant welcomeTour js file call from manifest

## [0.15.1] - 2020-01-22
### Fixed
- Gecko ID correction for Firefox, in preparation of the first non-beta release.

## [0.15.0] - 2020-01-22
### Changed
- Translation updates.

### Fixed
- Correctly check for maximum lengths of the extension's names and descriptions (for Chrome store).
- Change how the original article HTML is cached, to avoid problems with some gadgets (e.g. wikiminiatlas).
- Correct display of revision popup content

### Removed
- Don't ask for the [tabs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions#API_permissions)
  browser permission because it's not required.

## [0.14.0] - 2020-01-16
### Added
- Show "edit summary removed" message in the revision details pop-up when an edit summary has been hidden.

### Fixed
- Add the `mediawiki.api` module to the initial dependencies. Fixes a bug in the loading of WWT in some cases with the welcome popup.
- Correctly determine the interface language in all sitations (to match MediaWiki).

### Changed
- Updated code linting rulesets.
- Translation updates.

## [0.13.0] - 2020-01-10
### Added
- Utility to check that Firefox browser store descriptions are up to date with Translatewiki.

### Fixed
- Show revision details popup on top of infobar.
- Correct the byte difference sign for RTL languages in the revision details popup.
- Correctly load translations for languages with a variant code (e.g. `pt-br`).
- Fix to prevent loading on Turkish Wikipedia special pages.

### Changed
- Change wiki templates' opacity appearance on hover.
- MVC and other general refactoring.
- Translation updates, including fixing typos in message descriptions (qqq).
- Modified welcome tour language.

## [0.12.0] - 2019-12-19
### Fixed
- Prevent the WhoWroteThat button from appearing on the main page.

### Changed
- Fetch username from the MediaWiki API, and fade-in all content in the revision popup.
- UX improvements for infobar and guided-tour popup.
- Translation updates.

## [0.11.0] - 2019-12-13
### Added
- This change log.

### Fixed
- Build: Provide valid Gecko-ID for local development
- Prevent the extension script from loading more than once on a Wikipedia page
- Don't gray out tables as they can contain tokenized elements
- Don't gray out empty elements.
- Use our standard debug log format (for VE activation/deactivation messages)
- Correctly re-initialize WWT after VE deactivation
- Return to showing two 'shimmer' lines while loading the edit summary in a revision popup
- Show infobar on top of page status indicators.
- Show revision detials popup for image thumbnails.
- More thorough checks for revision IDs

### Changed
- Use WMF-hosted proxy to WikiWho API.
- Translation updates
- UX Improvements for the 'Guided Tour' popup
- Minor CSS class name improvement
- Minor out-of-date code removed or updated
- Change the sidebar link so it only works when clicked directly
  (and not when the empty space next to it is clicked)
- Show revision size in popup even when there's no revision comment

## [0.10.0] - 2019-11-27
### Changed
- Proxy: Use cURL instead of file_get_contents
- Build: Add different extension IDs for Firefox beta/prod extensions

## Fixed
- Build: Fix locale directory names to conform with browser expected format

## [0.9.0] - 2019-11-26
### Changed
- Translation updates
- Only show loading animation for the first load of the popup comment

### Fixed
- Correctly present the initial state of the WhoWroteThat activation button
- Correctly present the attribution score for IP editors
- Build: Corrected incorrect message variables

## [0.8.0] - 2019-11-08
### Changed
- Internationalization: truncate messages that are too long for extension store displays

## [0.7.0] - 2019-11-06
### Added
- Graying out items that have no available information
- Handling WhoWroteThat behavior with VisualEditor editing
- Build step creates necessary zip files for production and beta extensions

### Changed
- Translation updates
- Separate Chrome and Firefox manifests
- Remove HTML in translated messages

### Removed
- Removed gadget output when building

## [0.6.0] - 2019-10-31
### Added
- First tagged release
- Internationalization improvements

[Unreleased]: https://github.com/wikimedia/WhoWroteThat/compare/0.22.2...HEAD
[0.22.2]: https://github.com/wikimedia/WhoWroteThat/compare/0.22.1...0.22.2
[0.22.1]: https://github.com/wikimedia/WhoWroteThat/compare/0.22.0...0.22.1
[0.22.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.21.0...0.22.0
[0.21.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.20.0...0.21.0
[0.20.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.19.0...0.20.0
[0.19.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.18.0...0.19.0
[0.18.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.17.0...0.18.0
[0.17.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.16.2...0.17.0
[0.16.2]: https://github.com/wikimedia/WhoWroteThat/compare/0.16.1...0.16.2
[0.16.1]: https://github.com/wikimedia/WhoWroteThat/compare/0.16.0...0.16.1
[0.16.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.15.4...0.16.0
[0.15.4]: https://github.com/wikimedia/WhoWroteThat/compare/0.15.3...0.15.4
[0.15.3]: https://github.com/wikimedia/WhoWroteThat/compare/0.15.2...0.15.3
[0.15.2]: https://github.com/wikimedia/WhoWroteThat/compare/0.15.1...0.15.2
[0.15.1]: https://github.com/wikimedia/WhoWroteThat/compare/0.15.0...0.15.1
[0.15.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.14.0...0.15.0
[0.14.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.13.0...0.14.0
[0.13.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.12.0...0.13.0
[0.12.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.11.0...0.12.0
[0.11.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.10.0...0.11.0
[0.10.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.9.0...0.10.0
[0.9.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.8.0...0.9.0
[0.8.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.7.0...0.8.0
[0.7.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.6.0...0.7.0
[0.6.0]: https://github.com/wikimedia/WhoWroteThat/releases/tag/0.6.0

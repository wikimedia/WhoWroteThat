# Changelog
All notable changes to this project will be documented in this file.
Please see [README](README.md) for installation, testing, and contribution instructions.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Fixed
- Build: Provide valid Gecko-ID for local development
- Prevent the extension script from loading more than once on a Wikipedia page

### Changed
- Translation updates

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

[Unreleased]: https://github.com/wikimedia/WhoWroteThat/compare/0.10.0...HEAD
[0.10.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.9.0...0.10.0
[0.9.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.8.0...0.9.0
[0.8.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.7.0...0.8.0
[0.7.0]: https://github.com/wikimedia/WhoWroteThat/compare/0.6.0...0.7.0
[0.6.0]: https://github.com/wikimedia/WhoWroteThat/releases/tag/0.6.0
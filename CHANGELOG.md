# Changelog

All notable changes to this project are documented here.

## [3.0.1] — 2026-06-16

### Fixed
- `xObject.interface` — hooks were silently dropped because the plugin used the old `global.jsa` namespace instead of `global.xObject`; same bug in `xObject.dbc`
- `xObject.interface` — `instance.hasOwnProperty("__implements__")` was always `false` because xObject mixes members onto `Fn.prototype` (inherited, not own properties); changed to a plain truthy check, matching the pattern already used by `xObject.dbc`
- `xObject.core` — argument validation on line 153 used `isArray(arg) && !isObject(arg)`, which is always `false` since arrays are objects; corrected to `!isArray(arg) && !isObject(arg)`
- `xObject.widget` — `var i = 0` (numeric) was used as the loop variable in a `for…in` over `HTML_PARSER`; changed to `var i`
- `xObject.interface`, `xObject.dbc` — removed unreachable `return true` after the `instanceof` branch in `matchArgTypeHint`

### Changed
- Replaced Grunt + QUnit with `npm run build` (terser) and `npm test` (Jest)
- Removed obsolete devDependencies: grunt, grunt-contrib-*, qunitjs, uglify-js
- Added devDependencies: jest ^29, terser ^5
- Removed `Gruntfile.js`, `.jshintrc`, `.jscsrc`, `.travis.yml`, `tests/index.html`, `tests/js/tests.js`, `tests/js/stubs.js`
- Replaced QUnit HTML test suite with 24 isolated Jest tests covering core, mixin, interface, dbc, widget, and prototype chain
- Updated `package.json`: modernised structure, added `keywords`, `engines`, corrected `repository.type` from `"github"` to `"git"`
- Rewrote README: removed stale badges and "unmaintained" warning, fixed broken code examples (`xObject(…)` → `xObject.create(…)`, missing commas, wrong variable names), added install and scripts sections, added contract properties table
- Added `doc/promo.svg` — dark-themed banner showing syntax-highlighted code and feature cards

## [3.0.0] — 2014–2021

Original release. Factory-based prototypal inheritance with plugin hooks for mixins, interfaces, design by contract, and YUI-style widget lifecycle. Published to npm; CI via Travis CI (Node 0.10).

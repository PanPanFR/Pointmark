# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). While the version stays below `1.0.0`, minor releases may contain breaking changes.

## [Unreleased]

## [0.1.0] - 2026-09-17

### Added

- Element picker toggled by `Alt+A`, the toolbar icon, or the picker button in the panel
- Composer with a free-text instruction, `compact` / `standard` detail levels, and Add / Copy actions
- Annotation list with per-row checkboxes, copy one row, copy selected, copy all, delete, and clear
- Markdown formatter emitting selector, tag, text, outer HTML, parent HTML, and instruction — plus ancestor chain, nearest heading, computed styles, geometry, page title, and XPath fallback at `standard` level
- Numbered on-page markers for elements already annotated
- Local persistence in `chrome.storage.local` with a 100-annotation cap
- Manual copy fallback when the page denies clipboard write access
- Manifest V3 background service worker for toolbar clicks and the `toggle-picker` command, with `!` and `F5` badges for restricted pages and stale tabs
- GitHub release workflow publishing a zip on every `v*` tag

[Unreleased]: https://github.com/PanPanFR/Pointmark/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/PanPanFR/Pointmark/releases/tag/v0.1.0

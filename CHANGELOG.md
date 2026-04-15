# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added

- `feature/figma-design-integration` branch aligning the web admin UI with Figma-exported concepts (`figma/`): ONE Albuquerque wordmark, blue gradient reporter shell, red gradient staff shell, and refreshed login / reporter / queue surfaces.
- `apps/web-admin` Vitest coverage for layout theme helpers used by the app shell.
- Figma “See That?” Montoya artwork on the login card and reporter home hero (`apps/web-admin/src/assets/see-that-montoya.png`, copied from the Figma export).

### Fixed

- `@call-pat/shared` is declared as an ES module (`"type": "module"`) so Node/tsx surface named exports such as `createReportBodySchema` correctly (API and tooling imports).

### Changed

- The web admin header now reflects role: field employees see the blue “See That?” style shell; dispatchers and admins see the red admin-style shell (per Figma `Landing` / `Admin` pages).
- Login is a full-viewport gradient page without the main chrome bar, matching the Figma landing/submit flow.
- Global CSS tokens and components updated toward Figma palette (`#5DADE2` / `#3498DB` blues, `#D4183D` / `#B01530` reds) while preserving existing class names used by reports and tables.
- Further UI polish: staff report/work-order detail headers match the queue strip; reporter list/detail/new-report use the blue page band, back links, elevated cards (`.card--panel`), filter toolbar on the queue, and a cleaner stacked new-report form (`.form-stack`).

### Notes

- API smoke tests (`npm run test -w @call-pat/api`) require a compiled `better-sqlite3` native addon. On Windows, install without `--ignore-scripts` (or run `npm rebuild better-sqlite3`) once a C++20-capable toolchain is available.

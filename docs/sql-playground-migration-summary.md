# SQL Playground Migration Summary

## Context

The FeedbackSystem platform (FBS) is a web application used in academic settings to manage courses, assignments, and automatic grading. One of its features is the SQL Playground — an interactive editor that lets students write and execute SQL queries against live databases directly in the browser.

Before this work, the SQL Playground was fully embedded inside the main Angular application (`fbs-core/web`). While functional, this tight coupling made the module harder to maintain and evolve independently. The goal of this migration was to extract it into a self-contained Angular application and re-integrate it into the main app transparently via an iframe.

## What Was Done

The SQL Playground feature code was migrated into a new standalone Angular project located at `modules/sql-playground/web`. This includes all the components, services, NgRx store logic, models, and dialogs that made up the original feature. The standalone app is built and served independently, on its own port, and behaves as a complete single-page application on its own.

On the main application side, a new Angular component — `SqlPlaygroundIframeComponent` — was created to replace the old direct route. When a user navigates to `/sqlplayground`, the main app now renders an iframe that points to the standalone service. The URL of that service is retrieved dynamically from a backend integration endpoint (`/api/v2/integrations/sqlplayground`), which reads the configured URL from `application.yml`. This follows the same pattern already used for the FBS-Modellierung module.

Authentication was handled through URL parameters: the main app reads the user's JWT from its own auth service and appends it as a `?token=...` query parameter when constructing the iframe URL. The standalone app then picks up the token on startup from `window.location.search`, stores it in `localStorage`, and uses it for all subsequent API calls. This ensures the user does not need to log in again inside the iframe.

To reach full UI parity with the original feature, the standalone app was configured with the same Angular Material theme (blue-grey/indigo palette), Roboto font, Material Icons, and all global component style overrides. The i18n translations (English and German) were also ported over and wired into the `i18next` configuration with browser language detection.

## Validation

A migration test procedure was run both before and after the extraction to check for functional regressions. The tests covered the main user flows: connecting to a database, running queries, viewing results, managing templates, and the co-working (shared session) feature. Screenshots and detailed results are stored under `docs/test-procedure`. No regressions were identified.

## Outcome

The SQL Playground now runs as an isolated service that can be developed, built, and deployed independently from the rest of the FBS platform. The integration with the main app remains seamless from the user's perspective — the feature is accessible at the same route, looks identical, and authentication is handled transparently. This separation makes the module easier to maintain and lays the groundwork for deploying it as a separate container in production.

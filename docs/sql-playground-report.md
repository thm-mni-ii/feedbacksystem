# SQL Playground — Module Isolation

## 1. Introduction

During my internship, one of the technical tasks I worked on was restructuring the SQL Playground feature of the FeedbackSystem platform. At the beginning of the project, this feature was directly integrated inside the main Angular application. While this worked functionally, it created architectural limitations as the platform continued to grow. The goal of my work was therefore to isolate SQL Playground into its own standalone Angular application, while keeping the user experience exactly the same from the user's point of view.

---

## 2. Context of the Project

The FeedbackSystem (FBS) is a web platform developed and maintained at Technische Hochschule Mittelhessen. It is used in academic courses to manage assignments, automatic grading, student submissions, and group work. The frontend is built with Angular and Angular Material, and the backend is a Scala API that exposes a REST interface. Several independent modules make up the platform, each covering a different area of functionality.

The SQL Playground is one of these modules. It gives students and teachers a browser-based interface to write and execute SQL queries directly against real databases. It supports multiple database types, a template system for reusable queries, a co-working mode for shared sessions, and automatic submission of query results for graded assignments. It is essentially a small interactive development environment embedded in the course workflow.

---

## 3. Initial Architecture

Before this work, the SQL Playground was fully integrated inside the main Angular application, in `modules/fbs-core/web`. This means all its components, services, state management (NgRx store), dialogs, and styles lived alongside the rest of the application code. The module was accessible through the `/sqlplayground` route like any other section of the main app.

However, this architecture has some limitations. The SQL Playground is a relatively large and complex feature, and keeping it directly inside the main application creates a strong coupling between components that are not necessarily related.

In practice, this means that even small modifications to SQL Playground require rebuilding the entire main application. As the platform grows and different modules evolve independently, this kind of tight integration can make maintenance and development slower over time.

---

## 4. Extraction of the SQL Playground Module

The first step was to understand exactly what the SQL Playground depended on inside the main application. This meant going through all the feature components, services, NgRx actions, reducers and effects, dialog components, models, and utility functions, and figuring out which ones were specific to SQL Playground and which ones were shared with the rest of the app.

To perform the migration, I created a new Angular 14 project located in `modules/sql-playground/web`. This included around 70 feature files: components for the query editor, the database control panel, the result table, the schema browser, templates, and co-working. The NgRx store for SQL Playground, the HTTP services, all the dialog components, and the Angular Material configuration all had to be reproduced in the new project.

One of the more involved parts was making sure the standalone app had the same visual appearance as the original module. This meant configuring the same Angular Material theme (a custom palette using blue-grey as the primary color and indigo as the accent), importing the Roboto font and Material Icons through `@fontsource`, and copying all the global component style overrides that affected tab labels, expansion panels, and the code editor. The i18n translations for both English and German also had to be ported over and wired into the `i18next` configuration with browser language detection.

---

## 5. Integration via iframe

Once the standalone application was working independently, it needed to be reintegrated into the main application. To reconnect the standalone application with the main platform, the solution chosen was to load it inside an iframe. The main app renders the standalone app in a full-page iframe when the user navigates to `/sqlplayground`.

To make this work cleanly, a new Angular component called `SqlPlaygroundIframeComponent` was created in the main application. This component is responsible for constructing the iframe URL and rendering it. The URL is not hardcoded — it is fetched at runtime from the backend through the integration endpoint `/api/v2/integrations/sqlplayground`, which returns the configured URL of the standalone service. This pattern was already used in the main app for another embedded module (FBS-Modellierung), so it was natural to follow the same approach.

The backend configuration was updated in `application.yml` to include the new `sqlplayground` integration, with the URL pointing to the standalone service. In a local development environment this is `http://localhost:4201/`, and in production it would be set through an environment variable.

From the user's perspective, navigating to the SQL Playground still works exactly as before. The URL changes, a full-page component loads, and the feature is fully functional. The fact that it now runs in an iframe is invisible.

---

## 6. Authentication and Token Forwarding

One challenge with the iframe approach is authentication. The standalone application is a completely separate Angular app with its own API calls, so it needs its own copy of the user's JWT. The main application manages authentication, so the token has to be passed from one app to the other at the moment the iframe loads.

The solution is straightforward: when the main app builds the iframe URL, it appends the user's token as a query parameter, resulting in a URL like `http://localhost:4201/?token=eyJ...`. The standalone app then reads this parameter from `window.location.search` at startup, stores it in `localStorage`, and removes it from the URL to keep things clean. From that point on, the standalone app behaves exactly like a normal Angular app with a stored token, the `@auth0/angular-jwt` library handles attaching it to outgoing HTTP requests automatically.

This approach is simple and works well in this context because the communication between the two apps only needs to happen once, at load time. Since the backend still validates the token on every request, this approach remains secure when used over an HTTPS connection.

---

## 7. Migration Testing Procedure

Before making any changes, I ran through the main user flows of the SQL Playground to document the baseline behavior. This included connecting to a database, running various types of queries, checking the result table, browsing the database schema, creating and using query templates, and trying the co-working shared session feature. Screenshots of each step were saved under `docs/test-procedure`.

After the migration was complete and the standalone app was integrated via iframe, I ran the same test procedure again and compared the results against the baseline. The goal was to make sure every feature behaved identically and that nothing had broken during the extraction.

No functional regressions were found. All the tested features worked the same way in the migrated version as they did in the original. The UI also looked identical, which validated that the theme, fonts, icons, and translations had all been correctly ported over.

---

## 8. Results and Observations

The SQL Playground now runs as an independent Angular application that can be built, tested, and deployed separately from the rest of FBS. The main application integrates it through a clean backend-driven iframe mechanism, and authentication is handled transparently.

Interestingly, the migration also revealed some implicit dependencies that were present in the original codebase. There were a few places where the original code relied on things being available globally in the main app (shared providers, implicit injection tokens) that had to be made explicit in the standalone project. This kind of cleanup tends to improve code quality overall.

The build and startup times of the main application are also slightly reduced, since it no longer compiles the SQL Playground code. For a project that is still growing, this kind of separation becomes more and more valuable over time.

---

## 9. Difficulties encountered
One of the main challenges during this task was understanding the existing dependencies of SQL Playground within the main Angular application. Since the module had evolved over time, some parts relied on shared services or configuration that were not immediately visible.

Another difficulty was reproducing the exact visual appearance of the original module in the standalone application. This required carefully porting themes, fonts, icons and global style overrides.

---

## 10 Technologies used
Technologies used in this task:

• Angular 14
• Angular Material
• NgRx (state management)
• TypeScript
• Scala backend (Spring Boot API)
• Docker and Docker Compose
• PostgreSQL and MongoDB

---

## 11. Conclusion

This task involved understanding a fairly large and interconnected feature, carefully extracting it from a larger codebase, and reintegrating it through a clean architectural boundary. The result is a better-isolated module that is easier to maintain, can evolve at its own pace, and can eventually be deployed as a separate container in a production environment.

Working on this task helped me gain a better understanding of how large Angular applications are structured and how complex modules can be separated into independent services. It was a good example of refactoring work where the user-visible result looks the same, but the underlying architecture is significantly cleaner.

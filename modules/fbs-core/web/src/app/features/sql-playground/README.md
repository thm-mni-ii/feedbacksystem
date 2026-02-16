# SQL Playground Feature

## Overview
Isolated SQL Playground functionality extracted from core app structure into a dedicated feature module.

**Status**:  Step 1 - Structure Created

---

## Entry Points

### Routes
- **Path**: `/sqlplayground`
- **Component**: `SqlPlaygroundComponent`
- **Guard**: `AuthGuard` (preserved)
- **Definition**: `app-routing.module.ts` line 98-100

### Navigation
- **Menu**: Sidebar navigation (sidebar.component.html line 78-82)
- **Label**: `sidebar.label.sqlPlayground` (i18n key)
- **Icon**: `extension`

---

## Components Inventory

### Main Component
- `sql-playground.component.ts` - Main playground container
- `sql-playground.module.ts` - Feature module with NgRx setup

### Sub-Components (17 total)
**Result Display**:
- `dynamic-result-table/` - Query result rendering
  - `tab/dynamic-result-table-tab.component.ts`

**Database Control**:
- `db-control-panel/` - Database management panel
  - `db-control-db-overview/` - Database overview/CRUD
  - `db-control-templates/` - Template management
  - `db-control-co-working/` - Collaboration features

**Schema Visualization**:
- `db-scheme/` - Database schema inspector
  - `db-scheme-tables/` - SQL tables view
  - `db-scheme-views/` - SQL views view
  - `db-scheme-triggers/` - SQL triggers view
  - `db-scheme-routines/` - SQL routines view
  - `db-scheme-mongo/db-scheme-collections/` - MongoDB collections
  - `db-scheme-mongo/db-scheme-views/` - MongoDB views
  - `db-scheme-mongo/db-scheme-indexes/` - MongoDB indexes

**SQL Editor**:
- `sql-input-tabs/` - Tabbed SQL editor
  - `highlighted-input/` - Syntax-highlighted input

**Shared UI**:
- `bordered-container/` - Reusable container component
- `collab/` - Collaboration UI components

---

## Services

### Dedicated Service
- `service/sql-playground.service.ts` - API client (214 lines)
  - CRUD operations for databases
  - SQL execution endpoints
  - Schema introspection (tables/views/triggers/routines)
  - Template management
  - Sharing/collaboration endpoints

---

## Models (11 files)

**Location**: `model/sql_playground/`

- `Database.ts` - Database metadata
- `Table.ts` - Table schema
- `View.ts` - View definitions
- `Trigger.ts` - Trigger metadata
- `Routine.ts` - Stored procedure/function metadata
- `Constraint.ts` - Table constraints
- `Template.ts` - SQL templates
- `TemplateCategory.ts` - Template categories
- `QueryTab.ts` - Editor tab state
- `SQLResponse.ts` - API response wrapper
- `SQLExecuteResponse.ts` - Execution results

---

## State Management (NgRx)

### Feature Stores (5 slices)
1. **`sqlPlayground`** - Main playground state
   - `state/sql-playground.{actions,reducer,effects,selectors}.ts`

2. **`sqlInputTabs`** - Editor tabs state
   - `sql-input-tabs/state/sql-input-tabs.{actions,reducer,effects,selectors}.ts`

3. **`dynamicResultTable`** - Result table state
   - `dynamic-result-table/state/dynamic-result-table.{actions,reducer,effects,selectors}.ts`

4. **`databases`** - Database list state
   - `db-control-panel/state/databases.{actions,reducer,effects,selectors}.ts`

5. **`templates`** - Templates state
   - `db-control-panel/state/templates.{actions,reducer,selectors}.ts`

6. **`groups`** - Collaboration groups state
   - `db-control-panel/state/groups.{actions,reducer,effects,selector}.ts`

---

## Dialogs (3 playground-specific)

**Location**: `dialogs/`

1. **`new-db-dialog/`** - Create new database dialog
2. **`new-sql-template/`** - Create SQL template dialog
3. **`share-playground-link-dialog/`** - Share playground session dialog

---

## Core Dependencies (DO NOT MOVE)

### Authentication & Authorization
-  `guards/auth.guard.ts` - Route protection
-  `service/auth.service.ts` - JWT handling/user context
-  HTTP interceptors (JWT attachment)

### State Management
-  Core `@ngrx/store` setup (app.module.ts)
-  User/role selectors from core state
-  `StoreDevtoolsModule` configuration

### Models
-  `model/User.ts` - User entity
-  `model/Group.ts` - Group entity (collaboration)
-  `model/JWTToken.ts` - Token structure

### Shared Modules
-  `modules/material-components.module.ts` - Angular Material
-  `I18NextModule` - Internationalization
-  `util/i18n.ts` - I18N_PROVIDERS

### HTTP Client
-  Angular `HttpClient` (configured in core)

---

##  Migration Plan (6 Steps)

###  Step 1: Create Feature Folder + Documentation
**Status**: DONE
- Created `features/sql-playground/` directory
- Documented complete inventory and plan

### Step 2: Create Feature Module Shell
- Create `features/sql-playground/sql-playground-routing.module.ts`
- Create `features/sql-playground/sql-playground.module.ts` (empty shell)
- Import in `app.module.ts` without changing routing yet

### Step 3: Move Models
- Move `model/sql_playground/` → `features/sql-playground/models/`
- Update imports in services/components
- Verify TypeScript compilation

### Step 4: Move Service
- Move `service/sql-playground.service.ts` → `features/sql-playground/services/`
- Update service imports
- Keep `providedIn: 'root'` or provide in feature module

### Step 5: Move Components & State
- Move all playground components from `page-components/sql-playground/` → `features/sql-playground/components/`
- Move state slices into `features/sql-playground/state/`
- Update internal component imports
- Update feature module declarations

### Step 6: Move Dialogs & Update Routes
- Move 3 dialogs → `features/sql-playground/dialogs/`
- Convert route to lazy-loaded module in `app-routing.module.ts`
- Update sidebar navigation import (if needed)
- Clean up old imports in `app.module.ts`

---

## Validation Checklist

After each step:
- [ ] `npm run start` succeeds (no TypeScript errors)
- [ ] Navigate to `/sqlplayground` - page loads
- [ ] AuthGuard still applies (redirect to login if not authenticated)
- [ ] Can create/delete databases
- [ ] Can execute SQL queries
- [ ] Can save/load templates
- [ ] Collaboration features work
- [ ] No console errors
- [ ] i18n labels render correctly

---

## Constraints

### Must NOT Change
-  Route path (`/sqlplayground`)
-  AuthGuard behavior
-  API endpoint URLs
-  UI behavior or layout
-  Data flow or state management logic
-  Database schema (backend)
-  i18n keys

### Must Preserve
-  All component functionality
-  NgRx store slices and selectors
-  Service API contracts
-  Dialog behaviors
-  Accessibility attributes
-  Styles and theming

---

##  Target Structure (After Migration)

```
features/sql-playground/
├── components/
│   ├── sql-playground.component.ts          # Main component
│   ├── sql-playground.component.html
│   ├── sql-playground.component.scss
│   ├── dynamic-result-table/                # Result display
│   │   ├── dynamic-result-table.component.ts
│   │   ├── tab/
│   │   └── state/
│   ├── db-control-panel/                    # Database controls
│   │   ├── db-control-panel.component.ts
│   │   ├── db-control-db-overview/
│   │   ├── db-control-templates/
│   │   ├── db-control-co-working/
│   │   └── state/
│   ├── db-scheme/                           # Schema viewer
│   │   ├── db-scheme.component.ts
│   │   ├── db-scheme-tables/
│   │   ├── db-scheme-views/
│   │   ├── db-scheme-triggers/
│   │   ├── db-scheme-routines/
│   │   └── db-scheme-mongo/
│   ├── sql-input-tabs/                      # Editor
│   │   ├── sql-input-tabs.component.ts
│   │   ├── highlighted-input/
│   │   └── state/
│   ├── bordered-container/                  # UI component
│   └── collab/                              # Collaboration
├── dialogs/
│   ├── new-db-dialog/
│   ├── new-sql-template/
│   └── share-playground-link-dialog/
├── services/
│   └── sql-playground.service.ts
├── models/
│   ├── Database.ts
│   ├── Table.ts
│   ├── View.ts
│   ├── Trigger.ts
│   ├── Routine.ts
│   ├── Constraint.ts
│   ├── Template.ts
│   ├── TemplateCategory.ts
│   ├── QueryTab.ts
│   ├── SQLResponse.ts
│   └── SQLExecuteResponse.ts
├── state/
│   ├── sql-playground.actions.ts
│   ├── sql-playground.reducer.ts
│   ├── sql-playground.effects.ts
│   └── sql-playground.selectors.ts
├── sql-playground-routing.module.ts
├── sql-playground.module.ts
└── README.md
```

---

##  Related Backend Migrations

Database migrations that support this feature (API contract reference):
- `08_sql_playground.sql` - Initial tables
- `09_sql_playground_use_correct_datatype.sql`
- `10_sql_playground_fix_statement_data_type.sql`
- `11_sql_playground_soft_delete_databases.sql`
- `19_playground_share_token.sql` - Sharing functionality

---

##  Notes

- Module uses `StoreModule.forFeature()` for each NgRx slice (6 total)
- Uses `EffectsModule.forFeature()` for async operations
- Includes StoreDevtools configuration (dev only)
- i18n keys start with `sidebar.label.sqlPlayground`
- Service uses `/api/v2/playground/` endpoints
- Supports both SQL (MySQL/PostgreSQL) and MongoDB

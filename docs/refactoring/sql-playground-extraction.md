# SQL Playground Feature Extraction

## Summary

This document tracks the extraction of the SQL Playground feature from the core application structure into an isolated feature module.

**Date Started**: February 2, 2026  
**Target Location**: `modules/fbs-core/web/src/app/features/sql-playground/`  
**Constraint**: Must remain within Angular project boundaries

---

## Scope

### What's Being Extracted (Complete Inventory)

**Main Component**: 1 component  
**Sub-Components**: 17 components (result tables, db control, schema viewer, SQL editor, collaboration)  
**Services**: 1 service (sql-playground.service.ts, 214 lines)  
**Models**: 11 TypeScript interfaces  
**State Slices**: 6 NgRx feature stores  
**Dialogs**: 3 modal dialogs  
**Route**: `/sqlplayground` (path preserved)

### What Stays in Core

- `guards/auth.guard.ts` - Authentication
- `service/auth.service.ts` - User context
- `model/User.ts`, `model/Group.ts` - Core entities
- `modules/material-components.module.ts` - Shared UI
- `I18NextModule` + `util/i18n.ts` - Internationalization
- Core NgRx store setup

---

## Migration Steps

### ✅ Step 1: Structure + Documentation (DONE)
**Date**: 2026-02-02  
**Actions**:
- Created `features/sql-playground/` directory
- Created comprehensive README with inventory
- Created REFACTORING_LOG.md (this file)

**Validation**:
```bash
ls features/sql-playground/
# Expected: README.md exists
```

**Commit**: `refactor(sql-playground): create feature folder structure`

---

### ✅ Step 2: Create Feature Module Shell (DONE)
**Date**: 2026-02-02  
**Actions**:
- Created `features/sql-playground/sql-playground.module.ts` (empty shell)
- Created `features/sql-playground/sql-playground-routing.module.ts` (empty routes)
- Updated `app.module.ts` to import both old and new modules temporarily

**Files Created**:
1. `modules/fbs-core/web/src/app/features/sql-playground/sql-playground.module.ts`
2. `modules/fbs-core/web/src/app/features/sql-playground/sql-playground-routing.module.ts`

**Files Modified**:
1. `modules/fbs-core/web/src/app/app.module.ts`
   - Line 103: Added import with alias `SqlPlaygroundFeatureModule`
   - Line 248: Added module to imports array

**Validation**:
```bash
npm run build
# Expected: Build succeeds, both modules coexist
```

**Commit**: `refactor(sql-playground): add feature module shell`

---

### ⏳ Step 3: Move Models
**Goal**: Set up empty feature module without moving code yet

**Files to Create**:
1. `features/sql-playground/sql-playground.module.ts`
2. `features/sql-playground/sql-playground-routing.module.ts`

**Files to Edit**:
1. `app.module.ts` - Import new module temporarily (keep old import too)

**Validation**:
```bash
npm run build
# Should compile without errors
```

**Commit**: `refactor(sql-playground): add feature module shell`

---

### ⏳ Step 3: Move Models
**Goal**: Relocate TypeScript interfaces to feature directory

**Move Operations**:
```
model/sql_playground/*.ts → features/sql-playground/models/
```

**Files to Update** (imports):
- `service/sql-playground.service.ts`
- All components in `page-components/sql-playground/`
- All state files (actions/reducers/effects)
- 3 dialog components

**Validation**:
```bash
npm run build
# Check: no import errors
```

**Commit**: `refactor(sql-playground): move models to feature folder`

---

### ✅ Step 4: Move Service (DONE)
**Date**: 2026-02-05  
**Actions**:
- Created `features/sql-playground/services/` directory
- Moved `sql-playground.service.ts` from `service/` to `features/sql-playground/services/`
- Updated model imports within service (relative paths to `../models/`)
- Updated 5 import statements across components/effects/dialogs
- Deleted old `service/sql-playground.service.ts`

**Files Modified**:
- `page-components/sql-playground/db-control-panel/db-control-db-overview/` (1 import)
- `page-components/sql-playground/db-control-panel/db-control-co-working/` (1 import)
- `page-components/sql-playground/db-control-panel/state/databases.effects.ts` (1 import)
- `page-components/sql-playground/state/sql-playground.effects.ts` (1 import)
- `dialogs/new-db-dialog/new-db-dialog.component.ts` (1 import)

**Service Strategy**:
- Kept `providedIn: 'root'` - service remains globally available
- No need to add to feature module providers

**Validation**:
```bash
npm run build
# Expected: Build succeeds
grep -r "service/sql-playground" src/app
# Expected: no results
```

**Commit**: `refactor(sql-playground): move service to feature folder`

---

### ⏳ Step 5: Move Components & State
**Goal**: Relocate API service to feature directory

**Move Operations**:
```
service/sql-playground.service.ts → features/sql-playground/services/
```

**Files to Update** (imports):
- All components using `SqlPlaygroundService`
- All effects files
- `dialogs/new-db-dialog/new-db-dialog.component.ts`

**Provide Strategy**:
- Keep `providedIn: 'root'` OR
- Add to `sql-playground.module.ts` providers

**Validation**:
```bash
npm run build
ng serve
# Navigate to /sqlplayground
# Test: create database, execute query
```

**Commit**: `refactor(sql-playground): move service to feature folder`

---

### ⏳ Step 5: Move Components & State
**Goal**: Relocate all components and NgRx state to feature directory

**Move Operations**:
```
page-components/sql-playground/*.ts → features/sql-playground/components/
page-components/sql-playground/*/  → features/sql-playground/components/*/
```

**Sub-folders to Move**:
- `dynamic-result-table/` (+ state/)
- `db-control-panel/` (+ state/)
- `db-scheme/` (+ subdirectories)
- `sql-input-tabs/` (+ state/)
- `bordered-container/`
- `collab/`

**State Consolidation**:
- Move top-level `state/` into `features/sql-playground/state/`
- Keep nested state folders with their components

**Files to Update**:
- `features/sql-playground/sql-playground.module.ts` - Update declarations/imports
- Internal component imports (relative paths)
- State imports in components

**Validation**:
```bash
npm run build
ng serve
# Full feature test: DB CRUD, query execution, templates, collaboration
```

**Commit**: `refactor(sql-playground): move components and state to feature folder`

---

### ⏳ Step 6: Move Dialogs & Finalize Routing
**Goal**: Move dialogs, enable lazy loading, clean up core imports

**Move Operations**:
```
dialogs/new-db-dialog/ → features/sql-playground/dialogs/
dialogs/new-sql-template/ → features/sql-playground/dialogs/
dialogs/share-playground-link-dialog/ → features/sql-playground/dialogs/
```

**Files to Update**:
1. `features/sql-playground/sql-playground.module.ts` - Declare dialogs
2. `features/sql-playground/sql-playground-routing.module.ts` - Define routes
3. `app-routing.module.ts` - Convert to lazy-loaded route:
   ```typescript
   {
     path: "sqlplayground",
     loadChildren: () => import('./features/sql-playground/sql-playground.module')
       .then(m => m.SqlPlaygroundModule),
     canActivate: [AuthGuard]
   }
   ```
4. `app.module.ts` - Remove old `SqlPlaygroundModule` import
5. Component imports (db-control-db-overview, db-control-templates)

**Validation**:
```bash
npm run build
ng serve
# Navigate to /sqlplayground
# Verify lazy loading (check Network tab - module loads on demand)
# Test all dialogs: create DB, create template, share link
# Verify AuthGuard redirects unauthenticated users
```

**Commit**: `refactor(sql-playground): move dialogs and enable lazy loading`

---

## Rollback Strategy

Each step is a separate commit. To rollback:
```bash
git log --oneline --grep="sql-playground"
git revert <commit-hash>
```

---

## Testing Protocol (After Each Step)

### Build Check
```bash
npm run build
```
Expected: Zero TypeScript errors

### Runtime Check
```bash
ng serve
```
Navigate to: `http://localhost:4200/sqlplayground`

### Functional Tests
1. **Auth**: Logout → try to access `/sqlplayground` → redirects to login
2. **DB CRUD**: Create database → verify in list → delete → verify removed
3. **Query Execution**: Select database → write SQL → execute → see results
4. **Templates**: Open templates panel → create template → save → reload → verify exists
5. **Collaboration**: Share link → copy token → verify modal closes
6. **Schema View**: Expand tables/views/triggers → verify schema display
7. **i18n**: Check sidebar label renders correctly

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Import path breaks | Medium | High | Grep all imports before moving files |
| Lazy loading breaks AuthGuard | Low | High | Test auth redirection explicitly |
| NgRx store selectors break | Medium | Medium | Keep feature names identical |
| Dialog injection fails | Low | Medium | Declare in feature module + test |
| Circular dependencies | Low | Medium | Use barrel exports, avoid cross-imports |

---

## Current Status

- [x] Step 1: Structure + Documentation ✅
- [x] Step 2: Feature Module Shell ✅
- [x] Step 3: Move Models ✅
- [x] Step 4: Move Service ✅
- [x] Step 5: Move Components & State ✅
- [ ] Step 6: Move Dialogs & Finalize Routing

**Next Action**: Execute Step 6

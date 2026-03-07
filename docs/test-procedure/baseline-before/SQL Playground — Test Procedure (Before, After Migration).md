# SQL Playground — Complete Test Procedure (Before / After Migration)

## Purpose
Ensure 0 behavioral changes when outsourcing SQL Playground into a standalone Angular project embedded via iframe.
All functionality must work identically in PostgreSQL and MongoDB modes.

This procedure is executed:
- BEFORE migration (current system)
- AFTER migration (iframe + standalone container)

Pass/Fail is recorded for every action.

---

# PART 1 — PostgreSQL Mode

## 1. Control Section

### 1.1 Database Type Selection
- [ ] Switch DB type to PostgreSQL
- [ ] Verify page reload occurs
- [ ] Verify PostgreSQL mode UI is active
- [ ] Refresh page → verify PostgreSQL mode persists

### 1.2 Database Management
- [ ] Select existing DB
- [ ] Switch to different DB
- [ ] Create new DB (valid name)
- [ ] Create DB (invalid name → validation error) => No character whitelist validation observed (special characters allowed). Validation appears length-based only.
- [ ]  Delete non-active DB (verify expected behavior) => UI shows confirmation, list updates only after manual reload

### 1.3 Templates (PostgreSQL only)
- [ ] Open Templates tab
- [ ] Select each template category
- [ ] Insert template into editor
- [ ] Edit template (admin only) => Edit Templates: button visible for admin, but action has no effect
- [ ] Delete template (admin only) => Delete Templates: same as Edit template

### 1.4 Collaborative Mode (PostgreSQL only)
> Note (Local): Collaborative mode / Co-working features are excluded from local testing because they are not functional in the local environment. They will be validated only in production (if required). Not tested locally (out of scope).

---

## 2. Queries Section (PostgreSQL)

### 2.1 Tab Management
- [ ] Add new tab
- [ ] Rename tab
- [ ] Close tab
- [ ] Close all tabs
- [ ] Download active tab
- [ ] Download all tabs
- [ ] Tabs persist after reload
- [ ] Delete the last remaining tab  
- Expected: A new empty tab is automatically created.  
- The UI must never remain without at least one query tab.  
  
- [ ] Query recovery via localStorage  
- Write a query in a tab (e.g., SELECT 1 AS recovery_test;)  
- Refresh the page  
- Expected: The query content is restored from localStorage.  
- Close browser and reopen application (optional)  
- Expected: Last saved tabs are restored correctly.

### 2.2 Editor Behavior
- [ ] SQL syntax highlighting works
- [ ] Tab key inserts tab
- [ ] Shift+Enter inserts newline
- [ ] Ctrl+Enter executes query

### 2.3 Query Execution
- [ ] `SELECT 1 AS test;`
- [ ] `SELECT * FROM hotel LIMIT 5;`
- [ ] `SELECT * FROM nonexistent_table;` => error shown in results tab
- [ ] Multi-statement input executes only first statement
Input : 
`SELECT 1 AS a;`
`SELECT 2 AS b;`
Expected :
- Only the **first** statement is executed.
    
- Results show `a = 1`.
    
- The second statement is ignored (no second result tab / no second output).
    
- No crash; behavior is stable.

- [ ] Long-running query 
`SELECT pg_sleep(10);`
**Expected :**

- Query starts (loading spinner visible).
    
- After a short time, it fails with error:  
    `ERROR: canceling statement due to statement timeout`
    
- UI shows the error card/snackbar (same place as other SQL errors).
    
- Console has no additional unexpected errors.
  
`SELECT pg_sleep(3);`
**Expected :**

- Query succeeds
    
- No timeout error.
  
### 2.4 Submit Mode
- [ ] Activate submit mode
- [ ] Select course
- [ ] Select task
- [ ] Toggle description visibility
- [ ] Submit to task
- [ ] Verify success icon
- [ ] Verify error icon
- [ ] Exit submit mode

---

## 3. Results Section (PostgreSQL)

- [ ] Empty state visible when no results
- [ ] Result tab added automatically
- [ ] Close result tab
- [ ] Loading spinner appears
- [ ] SQL error card displayed
- [ ] Result table renders correctly
- [ ] Pagination works
- [ ] Empty result set handled
- [ ] Large result set handled

---

## 4. DB Schema Section (PostgreSQL)

### Tables
- [ ] Table list loads
- [ ] Expand table
- [ ] Show table data button
- [ ] Columns displayed
- [ ] Constraints displayed

### Views
`CREATE OR REPLACE VIEW v_hotel AS`
`SELECT * FROM hotel;`
- [ ] View list loads
- [ ] Expand view
- [ ] SQL definition visible

### Triggers
`CREATE TABLE IF NOT EXISTS trigger_test (`
  `id serial PRIMARY KEY,`
  `val text`
`);`

`CREATE OR REPLACE FUNCTION trg_fn()`
`RETURNS trigger`
`LANGUAGE plpgsql`
`AS $$`
`BEGIN`
  `NEW.val := COALESCE(NEW.val, 'default');`
  `RETURN NEW;`
`END;`
`$$;`

`DROP TRIGGER IF EXISTS trg_set_default ON trigger_test;`

`CREATE TRIGGER trg_set_default`
`BEFORE INSERT ON trigger_test`
`FOR EACH ROW`
`EXECUTE FUNCTION trg_fn();`

- [ ] Trigger list loads
- [ ] Expand trigger
- [ ] Timing + SQL shown

### Routines
`CREATE OR REPLACE FUNCTION f_one()`
`RETURNS int`
`LANGUAGE sql`
`AS $$`
  `SELECT 1;`
`$$;`

- [ ] Routine list loads
- [ ] Expand routine
- [ ] Parameters + definition shown

---

# PART 2 — MongoDB Mode

## 5. Control Section (MongoDB)

- [ ] Switch DB type to MongoDB
- [ ] Verify page reload
- [ ] Select Mongo DB
- [ ] Reset Mongo DB

---

## 6. Queries Section (MongoDB)

- [ ] Run basic find on restaurants
`db.restaurants.find().limit(5)`
- [ ] Run count on customers
`db.customers.countDocuments()`
- [ ] Run invalid query
`db.nonexistent_collection.find()`
- [ ] Create/switch/close tabs
- [ ] Execute via button
- [ ] Execute via Ctrl+Enter

---

## 7. Results Section (MongoDB)

- [ ] JSON result block renders
- [ ] Error JSON displays correctly
- [ ] Large JSON handled
- [ ] Empty result handled

---

## 8. DB Schema Section (MongoDB)

### Collections
- [ ] Collections list loads
- [ ] Expand collection
- [ ] Document count displayed

### Indexes
- [ ] Index list loads
- [ ] Expand index
- [ ] Key fields displayed

### Views
`db.createView("v_restaurants", "restaurants", [])`
- [ ] Mongo views list loads

---

# PART 3 — Cross-Cutting Tests

## Authentication
- [ ] Logged out → redirect to login
- [ ] Logged in → direct access
- [ ] Reload does not require re-login

## Token Passing (After Migration Only)
- [ ] iframe exists
- [ ] iframe src contains token and iframe=true

## Console & Network
- [ ] No unexpected console errors
- [ ] No 401/403 errors except expected permission cases

---

# Acceptance Criteria

- Every test case passes BEFORE migration
- Every test case passes AFTER migration
- Evidence captured before/after (screenshots) stored under docs/test-baseline/…
- No behavioral change observed
- Standalone SQL Playground is fully functional
- Integrated via iframe under /sqlplayground
- Angular upgraded incrementally to v21 with one commit per version
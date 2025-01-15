import { createAction, props } from "@ngrx/store";
import { Database } from "src/app/model/sql_playground/Database";

export const loadDatabases = createAction("[Databases] Load Databases");
export const loadDatabasesSuccess = createAction(
  "[Databases] Load Databases Success",
  props<{ databases: Database[] }>()
);
export const loadDatabasesFailure = createAction(
  "[Databases] Load Databases Failure",
  props<{ error: any }>()
);

export const createDatabase = createAction(
  "[Databases] Create Database",
  props<{ name: string }>()
);
export const createDatabaseSuccess = createAction(
  "[Databases] Create Database Success",
  props<{ database: Database }>()
);
export const createDatabaseFailure = createAction(
  "[Databases] Create Database Failure",
  props<{ error: any }>()
);

export const deleteDatabase = createAction(
  "[Databases] Delete Database",
  props<{ id: number }>()
);
export const deleteDatabaseSuccess = createAction(
  "[Databases] Delete Database Success",
  props<{ id: number }>()
);
export const deleteDatabaseFailure = createAction(
  "[Databases] Delete Database Failure",
  props<{ error: any }>()
);

export const activateDatabase = createAction(
  "[Databases] Activate Database",
  props<{ id: number }>()
);
export const activateDatabaseSuccess = createAction(
  "[Databases] Activate Database Success",
  props<{ id: number }>()
);
export const activateDatabaseFailure = createAction(
  "[Databases] Activate Database Failure",
  props<{ error: any }>()
);

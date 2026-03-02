import { createAction, props } from "@ngrx/store";
import { Database } from "src/app/model/sql_playground/Database";

export const loadDatabases = createAction(
  "[Databases] Load Databases",
  props<{ dbType: "postgres" | "mongo" }>()
);
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
  props<{ name: string; dbType: "postgres" | "mongo" }>()
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
  props<{ id: number | string; dbType: "postgres" | "mongo" }>()
);
export const deleteDatabaseSuccess = createAction(
  "[Databases] Delete Database Success",
  props<{ id: number | string }>()
);
export const deleteDatabaseFailure = createAction(
  "[Databases] Delete Database Failure",
  props<{ error: any }>()
);

export const activateDatabase = createAction(
  "[Databases] Activate Database",
  props<{ id: number | string; dbType: "postgres" | "mongo" }>()
);
export const activateDatabaseSuccess = createAction(
  "[Databases] Activate Database Success",
  props<{ id: number | string }>()
);
export const activateDatabaseFailure = createAction(
  "[Databases] Activate Database Failure",
  props<{ error: any }>()
);

export const resetMongoDatabase = createAction(
  "[Databases] Reset Mongo Database",
  props<{ id: string }>()
);
export const resetMongoDatabaseSuccess = createAction(
  "[Databases] Reset Mongo Database Success"
);
export const resetMongoDatabaseFailure = createAction(
  "[Databases] Reset Mongo Database Failure",
  props<{ error: any }>()
);

import { createReducer, on } from "@ngrx/store";
import { Database } from "src/app/model/sql_playground/Database";
import {
  loadDatabases,
  loadDatabasesSuccess,
  loadDatabasesFailure,
  createDatabase,
  createDatabaseSuccess,
  createDatabaseFailure,
  deleteDatabase,
  deleteDatabaseSuccess,
  deleteDatabaseFailure,
  activateDatabase,
  activateDatabaseSuccess,
  activateDatabaseFailure,
  resetMongoDatabase,
  resetMongoDatabaseSuccess,
  resetMongoDatabaseFailure,
} from "./databases.actions";

export interface DatabasesState {
  databases: Database[];
  currentDbType: "postgres" | "mongo";
  error: any;
}

export const initialState: DatabasesState = {
  databases: [],
  currentDbType:
    (localStorage.getItem("playground-db-type") as "postgres" | "mongo") ||
    "postgres",
  error: null,
};

export const databasesReducer = createReducer(
  initialState,
  on(loadDatabases, (state, { dbType }) => ({
    ...state,
    currentDbType: dbType,
  })),
  on(loadDatabasesSuccess, (state, { databases }) => ({ ...state, databases })),
  on(loadDatabasesFailure, (state, { error }) => ({ ...state, error })),
  on(createDatabase, (state) => ({ ...state })),
  on(createDatabaseSuccess, (state, { database }) => ({
    ...state,
    databases: [...state.databases, database],
  })),
  on(createDatabaseFailure, (state, { error }) => ({ ...state, error })),
  on(deleteDatabase, (state) => ({ ...state })),
  on(deleteDatabaseSuccess, (state, { id }) => ({
    ...state,
    databases: state.databases.filter((db) => db.id !== id),
  })),
  on(deleteDatabaseFailure, (state, { error }) => ({ ...state, error })),
  on(activateDatabase, (state) => ({ ...state })),
  on(activateDatabaseSuccess, (state, { id }) => ({
    ...state,
    databases: state.databases.map((db) =>
      db.id === id ? { ...db, active: true } : { ...db, active: false }
    ),
  })),
  on(activateDatabaseFailure, (state, { error }) => ({ ...state, error })),
  on(resetMongoDatabase, (state) => ({ ...state })),
  on(resetMongoDatabaseSuccess, (state) => ({ ...state })),
  on(resetMongoDatabaseFailure, (state, { error }) => ({ ...state, error }))
);

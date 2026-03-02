import { createFeatureSelector, createSelector } from "@ngrx/store";
import { DatabasesState } from "./databases.reducer";

export const selectDatabasesState =
  createFeatureSelector<DatabasesState>("databases");

export const selectAllDatabases = createSelector(
  selectDatabasesState,
  (state: DatabasesState) => state.databases
);

export const selectCurrentDbType = createSelector(
  selectDatabasesState,
  (state: DatabasesState) => state.currentDbType
);

export const selectDatabasesForCurrentType = createSelector(
  selectAllDatabases,
  selectCurrentDbType,
  (databases, currentDbType) => {
    if (currentDbType === "postgres") {
      return databases.filter((db) => db.dbType !== "MONGO");
    } else {
      return databases.filter((db) => db.dbType === "MONGO");
    }
  }
);

export const selectDatabasesError = createSelector(
  selectDatabasesState,
  (state: DatabasesState) => state.error
);

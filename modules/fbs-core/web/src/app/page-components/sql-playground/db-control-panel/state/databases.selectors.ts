import { createFeatureSelector, createSelector } from "@ngrx/store";
import { DatabasesState } from "./databases.reducer";

export const selectDatabasesState =
  createFeatureSelector<DatabasesState>("databases");

export const selectAllDatabases = createSelector(
  selectDatabasesState,
  (state: DatabasesState) => state.databases
);
export const selectDatabasesError = createSelector(
  selectDatabasesState,
  (state: DatabasesState) => state.error
);

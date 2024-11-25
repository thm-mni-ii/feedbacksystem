import { createFeatureSelector, createSelector } from "@ngrx/store";
import { SqlPlaygroundState } from "./sql-playground.reducer";

export const selectSqlPlaygroundState =
  createFeatureSelector<SqlPlaygroundState>("sqlPlayground");

export const selectActiveDb = createSelector(
  selectSqlPlaygroundState,
  (state: SqlPlaygroundState) => state.activeDb
);

export const selectResultset = createSelector(
  selectSqlPlaygroundState,
  (state: SqlPlaygroundState) => state.resultset
);

export const selectTriggers = createSelector(
  selectSqlPlaygroundState,
  (state: SqlPlaygroundState) => state.triggers
);

export const selectRoutines = createSelector(
  selectSqlPlaygroundState,
  (state: SqlPlaygroundState) => state.routines
);

export const selectViews = createSelector(
  selectSqlPlaygroundState,
  (state: SqlPlaygroundState) => state.views
);

export const selectTables = createSelector(
  selectSqlPlaygroundState,
  (state: SqlPlaygroundState) => state.tables
);

export const selectConstraints = createSelector(
  selectSqlPlaygroundState,
  (state: SqlPlaygroundState) => state.constraints
);

export const selectIsQueryPending = createSelector(
  selectSqlPlaygroundState,
  (state: SqlPlaygroundState) => state.isQueryPending
);

export const selectError = createSelector(
  selectSqlPlaygroundState,
  (state: SqlPlaygroundState) => state.error
);

export const selectBackend = createSelector(
  selectSqlPlaygroundState,
  (state: SqlPlaygroundState) => state.backend
);

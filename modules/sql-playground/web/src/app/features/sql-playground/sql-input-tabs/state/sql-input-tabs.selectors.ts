import { createFeatureSelector, createSelector } from "@ngrx/store";
import { SqlInputTabsState } from "./sql-input-tabs.reducer";

export const selectSqlInputTabsState =
  createFeatureSelector<SqlInputTabsState>("sqlInputTabs");

export const selectTabs = createSelector(
  selectSqlInputTabsState,
  (state: SqlInputTabsState) => state.tabs
);

export const selectActiveTabIndex = createSelector(
  selectSqlInputTabsState,
  (state: SqlInputTabsState) => state.activeTabIndex
);

export const selectActiveTab = createSelector(
  selectSqlInputTabsState,
  (state: SqlInputTabsState) => state.tabs[state.activeTabIndex]
);

export const selectPending = createSelector(
  selectSqlInputTabsState,
  (state: SqlInputTabsState) => state.pending
);

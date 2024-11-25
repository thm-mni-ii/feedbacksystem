import { createFeatureSelector, createSelector } from "@ngrx/store";
import { DynamicResultTableState } from "./dynamic-result-table.reducer";

export const selectDynamicResultTableState =
  createFeatureSelector<DynamicResultTableState>("dynamicResultTable");

export const selectResultset = createSelector(
  selectDynamicResultTableState,
  (state: DynamicResultTableState) => state.resultset
);

export const selectIsQueryPending = createSelector(
  selectDynamicResultTableState,
  (state: DynamicResultTableState) => state.isQueryPending
);

export const selectActiveResId = createSelector(
  selectDynamicResultTableState,
  (state: DynamicResultTableState) => state.activeResId
);

export const selectTabs = createSelector(
  selectDynamicResultTableState,
  (state: DynamicResultTableState) => state.tabs
);

export const selectDataSource = createSelector(
  selectDynamicResultTableState,
  (state: DynamicResultTableState) => state.dataSource
);

export const selectDisplayedColumns = createSelector(
  selectDynamicResultTableState,
  (state: DynamicResultTableState) => state.displayedColumns
);

export const selectTabCounter = createSelector(
  selectDynamicResultTableState,
  (state: DynamicResultTableState) => state.tabCounter
);

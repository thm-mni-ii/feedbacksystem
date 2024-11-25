import { createReducer, on } from "@ngrx/store";
import { MatTableDataSource } from "@angular/material/table";
import { ResultTab } from "src/app/model/ResultTab";
import * as DynamicResultTableActions from "./dynamic-result-table.actions";

export interface DynamicResultTableState {
  resultset: any;
  isQueryPending: boolean;
  activeResId: number;
  tabCounter: number;
  tabs: ResultTab[];
  dataSource: MatTableDataSource<string[]>;
  displayedColumns: string[];
}

const initialState: DynamicResultTableState = {
  resultset: null,
  isQueryPending: false,
  activeResId: 0,
  tabCounter: 0,
  tabs: [],
  dataSource: new MatTableDataSource<string[]>(),
  displayedColumns: [],
};

export const dynamicResultTableReducer = createReducer(
  initialState,
  on(DynamicResultTableActions.tabAdded, (state, { tab, tabCounter }) => ({
    ...state,
    tabs: [...state.tabs, tab],
    tabCounter,
    activeResId: state.tabs.length,
  })),
  on(DynamicResultTableActions.tabClosed, (state, { index }) => ({
    ...state,
    tabs: state.tabs.filter((_, i) => i !== index),
  })),
  on(
    DynamicResultTableActions.activeTabUpdated,
    (state, { index, updatedTab }) => ({
      ...state,
      tabs: state.tabs.map((tab, i) =>
        i === index ? { ...tab, ...updatedTab } : tab
      ),
    })
  ),
  on(DynamicResultTableActions.updateResultset, (state, { resultset }) => ({
    ...state,
    resultset,
  })),
  on(
    DynamicResultTableActions.setQueryPending,
    (state, { isQueryPending }) => ({
      ...state,
      isQueryPending,
    })
  ),
  on(
    DynamicResultTableActions.handleResultSetChangeSuccess,
    (state, { change }) => ({
      ...state,
      ...change,
    })
  )
);

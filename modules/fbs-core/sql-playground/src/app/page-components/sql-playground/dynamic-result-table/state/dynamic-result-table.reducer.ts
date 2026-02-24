import { createReducer, on } from "@ngrx/store";
import { ResultTab } from "src/app/model/ResultTab";
import * as DynamicResultTableActions from "./dynamic-result-table.actions";

export interface DynamicResultTableState {
  resultset: any;
  isQueryPending: boolean;
  activeTabIndex: number;
  tabCounter: number;
  tabs: ResultTab[];
  displayedColumns: string[];
}

const initialState: DynamicResultTableState = {
  resultset: null,
  isQueryPending: false,
  activeTabIndex: 0,
  tabCounter: 0,
  tabs: [],
  displayedColumns: [],
};

export const dynamicResultTableReducer = createReducer(
  initialState,
  on(DynamicResultTableActions.tabAdded, (state, { tab, tabCounter }) => ({
    ...state,
    tabs: [...state.tabs, tab],
    tabCounter,
    activeTabIndex: state.tabs.length,
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
  on(DynamicResultTableActions.setActiveTabIndex, (state, { index }) => ({
    ...state,
    activeTabIndex: index,
  })),
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

import { createAction, props } from "@ngrx/store";
import { ResultTab } from "src/app/model/ResultTab";
import { MatTableDataSource } from "@angular/material/table";
import { DynamicResultTableState } from "./dynamic-result-table.reducer";

export const addTab = createAction("[Dynamic Result Table] Add Tab");
export const closeTab = createAction(
  "[Dynamic Result Table] Close Tab",
  props<{ index: number }>()
);
export const updateActiveTab = createAction(
  "[Dynamic Result Table] Update Active Tab",
  props<{ index: number }>()
);
export const updateResultset = createAction(
  "[Dynamic Result Table] Update Resultset",
  props<{ resultset: any }>()
);
export const setQueryPending = createAction(
  "[Dynamic Result Table] Set Query Pending",
  props<{ isQueryPending: boolean }>()
);

export const tabAdded = createAction(
  "[Dynamic Result Table] Tab Added",
  props<{ tab: ResultTab; tabCounter: number }>()
);
export const tabClosed = createAction(
  "[Dynamic Result Table] Tab Closed",
  props<{ index: number }>()
);
export const activeTabUpdated = createAction(
  "[Dynamic Result Table] Active Tab Updated",
  props<{ index: number; updatedTab: Partial<ResultTab> }>()
);

export const handleResultSetChange = createAction(
  "[Dynamic Result Table] Handle Result Set Change",
  props<{ resultset: any }>()
);

export const handleResultSetChangeSuccess = createAction(
  "[Dynamic Result Table] Handle Result Set Change Success",
  props<{ change: Partial<DynamicResultTableState> }>()
);

export const updateDataSource = createAction(
  "[Dynamic Result Table] Update Data Source",
  props<{
    dataSource: MatTableDataSource<string[]>;
    displayedColumns: string[];
  }>()
);

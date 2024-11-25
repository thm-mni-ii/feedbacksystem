import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { map, withLatestFrom, switchMap } from "rxjs/operators";
import * as DynamicResultTableActions from "./dynamic-result-table.actions";
import * as fromDynamicResultTable from "./dynamic-result-table.selectors";
import { ResultTab } from "../../../../model/ResultTab";
import { DynamicResultTableState } from "./dynamic-result-table.reducer";

@Injectable()
export class DynamicResultTableEffects {
  constructor(private actions$: Actions, private store: Store) {}

  addTab$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DynamicResultTableActions.addTab),
      withLatestFrom(
        this.store.select(fromDynamicResultTable.selectTabCounter),
        this.store.select(fromDynamicResultTable.selectTabs)
      ),
      map(([_action, tabCounter, _tabs]) => {
        const newTab = {
          id: crypto.randomUUID(),
          name: `Ergebnis Nr. ${tabCounter}`,
        };
        return DynamicResultTableActions.tabAdded({
          tab: newTab,
          tabCounter: tabCounter + 1,
        });
      })
    )
  );

  closeTab$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DynamicResultTableActions.closeTab),
      map((action) =>
        DynamicResultTableActions.tabClosed({ index: action.index })
      )
    )
  );

  updateActiveTab$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DynamicResultTableActions.updateActiveTab),
      withLatestFrom(
        this.store.select(fromDynamicResultTable.selectResultset),
        this.store.select(fromDynamicResultTable.selectDataSource),
        this.store.select(fromDynamicResultTable.selectDisplayedColumns)
      ),
      map(([action, resultset, _dataSource, displayedColumns]) => {
        console.log(resultset);
        const updatedTab = {
          error: resultset.error,
          errorMsg: resultset.error ? resultset.errorMsg : null,
          displayedColumns: resultset.error ? [] : displayedColumns,
          resultset: resultset,
        };
        console.log(updatedTab);
        return DynamicResultTableActions.activeTabUpdated({
          index: action.index,
          updatedTab,
        });
      })
    )
  );

  handleResultSetChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DynamicResultTableActions.handleResultSetChange),
      withLatestFrom(
        this.store.select(fromDynamicResultTable.selectTabs),
        this.store.select(fromDynamicResultTable.selectActiveResId)
      ),
      switchMap(([action, tabs, activeResId]) => {
        const { resultset } = action;

        const updatedTabs =
          tabs.length === 0
            ? [{ id: crypto.randomUUID(), name: "Result 1" }]
            : tabs;
        const newActiveResId = tabs.length === 0 ? 0 : activeResId;

        let change = {
          resultset,
          tabs: updatedTabs,
          activeResId: newActiveResId,
        } as Partial<DynamicResultTableState>;

        if (resultset && !resultset.error) {
          let displayedColumns = resultset.result[0].head;
          const columnNamesCount = {};
          displayedColumns.forEach((columnName) => {
            columnNamesCount[columnName] =
              (columnNamesCount[columnName] || 0) + 1;
          });
          displayedColumns = displayedColumns.map((columnName, index) =>
            columnNamesCount[columnName] > 1
              ? columnName + " ".repeat(index)
              : columnName
          );

          change = { ...change, displayedColumns };
        }
        return [
          DynamicResultTableActions.handleResultSetChangeSuccess({ change }),
          DynamicResultTableActions.updateActiveTab({
            index: newActiveResId,
          }),
        ];
      })
    )
  );
}

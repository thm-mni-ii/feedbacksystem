import { Component, OnInit, ViewChild } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { ResultTab } from "src/app/model/ResultTab";
import * as DynamicResultTableActions from "./state/dynamic-result-table.actions";
import * as fromDynamicResultTable from "./state/dynamic-result-table.selectors";
import * as fromSqlPlayground from "../state/sql-playground.selectors";
import { MatTabGroup } from "@angular/material/tabs";

@Component({
  selector: "app-dynamic-result-table",
  templateUrl: "./dynamic-result-table.component.html",
  styleUrls: ["./dynamic-result-table.component.scss"],
}) //, AfterViewInit
export class DynamicResultTableComponent implements OnInit {
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

  resultset$: Observable<any>;
  isQueryPending$: Observable<boolean>;
  activeTabIndex$: Observable<number>;
  tabs$: Observable<ResultTab[]>;
  displayedColumns$: Observable<string[]>;

  tabs: ResultTab[];
  activeTabIndex: number;
  isQueryPending: boolean;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.resultset$ = this.store.select(fromSqlPlayground.selectResultset);
    this.isQueryPending$ = this.store.select(
      fromSqlPlayground.selectIsQueryPending
    );
    this.activeTabIndex$ = this.store.select(
      fromDynamicResultTable.selectActiveTabIndex
    );
    this.tabs$ = this.store.select(fromDynamicResultTable.selectTabs);
    this.displayedColumns$ = this.store.select(
      fromDynamicResultTable.selectDisplayedColumns
    );

    this.resultset$.subscribe((resultset) => {
      if (resultset) {
        this.store.dispatch(
          DynamicResultTableActions.handleResultSetChange({ resultset })
        );
      }
    });
    this.tabs$.subscribe((tabs) => {
      this.tabs = tabs;
    });
    this.activeTabIndex$.subscribe((activeTabIndex) => {
      setTimeout(() => {
        this.activeTabIndex = activeTabIndex;
      }, 100);
    });
    this.isQueryPending$.subscribe((isQueryPending) => {
      this.isQueryPending = isQueryPending;
    });
  }

  closeTab(index: number) {
    this.store.dispatch(DynamicResultTableActions.closeTab({ index }));
  }

  updateActiveTab(index: number) {
    this.store.dispatch(DynamicResultTableActions.setActiveTabIndex({ index }));
  }

  addTab() {
    this.store.dispatch(DynamicResultTableActions.addTab());
  }
}

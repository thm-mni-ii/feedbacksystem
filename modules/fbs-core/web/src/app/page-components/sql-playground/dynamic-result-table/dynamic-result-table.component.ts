import { Component, ViewChildren, OnInit, QueryList } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { ResultTab } from "src/app/model/ResultTab";
import * as DynamicResultTableActions from "./state/dynamic-result-table.actions";
import * as fromDynamicResultTable from "./state/dynamic-result-table.selectors";
import * as fromSqlPlayground from "../state/sql-playground.selectors";
import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: "app-dynamic-result-table",
  templateUrl: "./dynamic-result-table.component.html",
  styleUrls: ["./dynamic-result-table.component.scss"],
}) //, AfterViewInit
export class DynamicResultTableComponent implements OnInit {
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  resultset$: Observable<any>;
  isQueryPending$: Observable<boolean>;
  activeResId$: Observable<number>;
  tabs$: Observable<ResultTab[]>;
  dataSource$: Observable<MatTableDataSource<string[]>>;
  displayedColumns$: Observable<string[]>;

  tabs: ResultTab[];
  activeResId: number;
  isQueryPending: boolean;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.resultset$ = this.store.select(fromSqlPlayground.selectResultset);
    this.isQueryPending$ = this.store.select(
      fromSqlPlayground.selectIsQueryPending
    );
    this.activeResId$ = this.store.select(
      fromDynamicResultTable.selectActiveResId
    );
    this.tabs$ = this.store.select(fromDynamicResultTable.selectTabs);
    this.dataSource$ = this.store.select(
      fromDynamicResultTable.selectDataSource
    );
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
      console.log("TABS", tabs);
      this.tabs = tabs;
    });
    this.activeResId$.subscribe((activeResId) => {
      this.activeResId = activeResId;
    });
    this.isQueryPending$.subscribe((isQueryPending) => {
      this.isQueryPending = isQueryPending;
    });
  }

  /*
  ngAfterViewInit() {
    this.paginator.changes.subscribe(() => {
      let dataSourceCounter = 0;
      this.tabs.forEach((tab) => {
        if (tab.dataSource !== undefined) {
          tab.dataSource.paginator =
            this.paginator.toArray()[dataSourceCounter];
          dataSourceCounter++;
        }
      });
    });
  }*/

  closeTab(index: number) {
    this.store.dispatch(DynamicResultTableActions.closeTab({ index }));
  }

  updateActiveTab(index: number) {
    this.store.dispatch(DynamicResultTableActions.updateActiveTab({ index }));
  }

  addTab() {
    this.store.dispatch(DynamicResultTableActions.addTab());
  }

  protected readonly MatTableDataSource = MatTableDataSource;

  getDataSource(tab: ResultTab) {
    return new MatTableDataSource<string[]>(tab.resultset.result[0].rows);
  }
}

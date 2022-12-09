import {
  Component,
  ViewChildren,
  Input,
  OnChanges,
  SimpleChanges,
  QueryList,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { SQLResponse } from "../../../model/sql_playground/SQLResponse";

export interface Content {
  head: any[];
  body: any[];
}

@Component({
  selector: "app-dynamic-result-table",
  templateUrl: "./dynamic-result-table.component.html",
  styleUrls: ["./dynamic-result-table.component.scss"],
})
export class DynamicResultTableComponent implements OnChanges {
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @Input() resultset: any;
  @Input() isQueryPending: boolean = false;
  /*   dataSource = new MatTableDataSource<any[]>(bigTable.rows);
  displayedColumns = bigTable.head; */
  dataSource: MatTableDataSource<string[]>;
  displayedColumns: string[] = [];

  activeResId: number = 0;
  tabCounter: number = 0;
  tabs: any[] = [];

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
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.isQueryPending &&
      changes.isQueryPending.firstChange === false
    ) {
      // isQueryPending changed
    }

    if (changes.resultset && changes.resultset.firstChange === false) {
      // isQueryPending changed
      if (this.resultset !== undefined && this.resultset.error === false) {
        this.dataSource = new MatTableDataSource<string[]>(
          this.resultset.result[0].rows
        );
      }

      let newTab: any = {};
      newTab.id = this.tabCounter;
      newTab.name = "Result";
      newTab.error = this.resultset.error;
      if (this.resultset.error == true) {
        newTab.errorMsg = this.resultset.errorMsg;
      } else if (this.resultset.error == false) {
        newTab.dataSource = this.dataSource;
        newTab.displayedColumns = this.resultset.result[0].head;
      } else {
        throw new Error("Unknown error");
      }

      this.tabs.push(newTab);

      this.tabCounter++;
      this.activeResId = this.tabs.length - 1;
    }
  }

  closeTab(index: number) {
    this.tabs.splice(index, 1);
  }

  tabChanged(event: any) {}
}

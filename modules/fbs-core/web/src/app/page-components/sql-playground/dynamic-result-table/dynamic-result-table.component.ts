import {
  Component,
  ViewChildren,
  Input,
  OnChanges,
  SimpleChanges,
  QueryList,
  AfterViewInit,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { ResultTab } from "src/app/model/ResultTab";

@Component({
  selector: "app-dynamic-result-table",
  templateUrl: "./dynamic-result-table.component.html",
  styleUrls: ["./dynamic-result-table.component.scss"],
})
export class DynamicResultTableComponent implements OnChanges, AfterViewInit {
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @Input() resultset: any;
  @Input() isQueryPending: boolean = false;
  /*   dataSource = new MatTableDataSource<any[]>(bigTable.rows);
  displayedColumns = bigTable.head; */
  dataSource: MatTableDataSource<string[]>;
  displayedColumns: string[] = [];

  activeResId: number = 0;
  tabCounter: number = 0;
  tabs: ResultTab[] = [];

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
        this.displayedColumns = this.resultset.result[0].head;
      }

      if (this.tabs.length === 0) {
        this.addTab();
      }

      this.updateActiveTab(this.activeResId);
    }
  }

  closeTab(index: number) {
    this.tabs.splice(index, 1);
  }

  updateActiveTab(index: number) {
    this.tabs[index].error = this.resultset.error;
    if (this.resultset.error == true) {
      this.tabs[index].errorMsg = this.resultset.errorMsg;
    } else if (this.resultset.error == false) {
      this.tabs[index].dataSource = this.dataSource;
      this.tabs[index].displayedColumns = this.resultset.result[0].head;
    } else {
      throw new Error("Unknown error");
    }
  }

  addTab() {
    this.tabs.push({
      id: this.tabCounter,
      name: "Ergebnis Nr.",
    });
    this.tabCounter++;

    setTimeout(() => {
      this.activeResId = this.tabs.length - 1;
    }, 10);
  }
}

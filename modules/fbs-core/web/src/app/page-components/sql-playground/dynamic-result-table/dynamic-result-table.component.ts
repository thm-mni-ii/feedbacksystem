import { AfterViewInit, Component, ViewChild, Input } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
/* import smallTable from "./test-tables/smallTable.json";
import middleTable from "./test-tables/mediumTable.json";
import bigTable from "./test-tables/largeTable.json" */

export interface Content {
  head: any[];
  body: any[];
}

@Component({
  selector: "app-dynamic-result-table",
  templateUrl: "./dynamic-result-table.component.html",
  styleUrls: ["./dynamic-result-table.component.scss"],
})
export class DynamicResultTableComponent {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() resultset: any;
  /*   dataSource = new MatTableDataSource<any[]>(bigTable.rows);
  displayedColumns = bigTable.head; */
  dataSource: MatTableDataSource<string[]>;
  displayedColumns: any[] = [];

  ngOnChanges() {
    if (this.resultset !== undefined && this.resultset.error === false) {
      this.displayedColumns = this.resultset.result[0].head;
      this.dataSource = new MatTableDataSource<string[]>(
        this.resultset.result[0].rows
      );
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
      }, 10);
    }
  }

  downloadResults() {}
}

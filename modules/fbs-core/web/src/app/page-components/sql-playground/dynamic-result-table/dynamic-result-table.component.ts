import { AfterViewInit, Component, ViewChild } from "@angular/core";
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
export class DynamicResultTableComponent implements AfterViewInit {
  /*   dataSource = new MatTableDataSource<any[]>(bigTable.rows);
  displayedColumns = bigTable.head; */
  dataSource = new MatTableDataSource<any[]>();
  displayedColumns = [];

  getData() {}

  downloadResults() {}

  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
}

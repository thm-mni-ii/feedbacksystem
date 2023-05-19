import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { ExcelCheckResult } from "src/app/model/ExcelCheckResult";
import { Submission } from "src/app/model/Submission";

@Component({
  selector: "app-excel-results",
  templateUrl: "./excel-results.component.html",
  styleUrls: ["./excel-results.component.scss"],
})
export class ExcelResultsComponent implements OnInit {
  displayedColumns = ["name", "cellName", "errorHint", "table", "result"];
  dataSource = new MatTableDataSource<ExcelCheckResult>([EXCEL_DATA]);

  constructor() {}

  ngOnInit(): void {}

  // toggleTableView() {
  //   this.tableViewAsGrid = !this.tableViewAsGrid;
  // }

  // selectLast() {
  //   setTimeout(() => (this.index = this.allSubmissions.length), 1);
  // }
}

const EXCEL_DATA: ExcelCheckResult = {
  exercises: [
    {
      name: "Aufgabe 1",
      errorCell: [
        {
          cellName: "B1",
          errorHint: "B1 ist Falsch!",
          consequentErrorCell: [
            {
              cellName: "B2",
              errorHint: "B2 ist Falsch!",
            },
          ],
        },
      ],
      table: "Table1",
      result: false,
    },
    {
      name: "Aufgabe 2",
      table: "Table1",
      result: true,
    },
  ],
};

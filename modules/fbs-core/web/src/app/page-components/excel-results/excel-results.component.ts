import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import {
  ExcelCheckResult,
  ExcelExercise,
} from "src/app/model/ExcelCheckResult";
import { Submission } from "src/app/model/Submission";

@Component({
  selector: "app-excel-results",
  templateUrl: "./excel-results.component.html",
  styleUrls: ["./excel-results.component.scss"],
})
export class ExcelResultsComponent implements OnInit {
  displayedColumns = ["name", "cellName", "errorHint", "table", "result"];
  dataSource = new MatTableDataSource<ExcelExercise>(EXCEL_DATA.exercises);

  constructor() {}

  ngOnInit(): void {
    console.log(this.dataSource);
  }

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
      name: "Übung 1 Rechteck",
      errorCell: [
        {
          cellName: "B6",
          errorHint: "Feldbezeichnungen für Ergebnisse falsch",
        },
        {
          cellName: "C3",
          errorHint: "Feldbezeichnungen für Ergebnisse falsch",
        },
        {
          cellName: "D5",
          errorHint: "Feldbezeichnungen für Ergebnisse falsch",
          consequentErrorCell: [
            {
              cellName: "D7",
              errorHint: "Feldbezeichnungen für Ergebnisse falsch",
            },
            {
              cellName: "D8",
              errorHint: "Feldbezeichnungen für Ergebnisse falsch",
            },
          ],
        },
      ],
      table: "Table1",
      result: false,
    },
    {
      name: "Übung 2  Kreis",
      errorCell: [
        {
          cellName: "B6",
          errorHint: "Feldbezeichnungen für Ergebnisse falsch",
        },
      ],
      table: "Table1",
      result: true,
    },
  ],
};

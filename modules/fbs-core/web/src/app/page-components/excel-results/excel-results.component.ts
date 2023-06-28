import { Component } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import {
  ExcelCell,
  ExcelCheckResult,
  ExcelExercise,
} from "src/app/model/ExcelCheckResult";
import { NestedTreeControl } from "@angular/cdk/tree";
import { MatTreeNestedDataSource } from "@angular/material/tree";

@Component({
  selector: "app-excel-results",
  templateUrl: "./excel-results.component.html",
  styleUrls: ["./excel-results.component.scss"],
})
export class ExcelResultsComponent {
  displayedColumns = ["name", "cellName", "errorHint", "table", "result"];
  dataSource = new MatTableDataSource<ExcelExercise>(EXCEL_DATA.exercises);

  treeControl = new NestedTreeControl<ExcelCell>(
    (node) => node.consequentErrorCell
  );
  treeDataSource = new MatTreeNestedDataSource<ExcelCell>();

  constructor() {
    this.treeDataSource.data = EXCEL_DATA.exercises[0].errorCell;
  }

  hasChild = (_: number, node: ExcelCell) =>
    !!node.consequentErrorCell && node.consequentErrorCell.length > 0;
}

const EXCEL_DATA: ExcelCheckResult = {
  exercises: [
    {
      name: "Übung 1 Rechteck",
      errorCell: [
        {
          cellName: "B6",
          errorHint: "Feldbezeichnungen für Ergebnisse falsch B6",
        },
        {
          cellName: "C3",
          errorHint: "Feldbezeichnungen für Ergebnisse falsch C3",
        },
        {
          cellName: "D5",
          errorHint: "Feldbezeichnungen für Ergebnisse falsch D3",
          consequentErrorCell: [
            {
              cellName: "D7",
              errorHint: "Feldbezeichnungen für Ergebnisse falsch D7",
              isConsequent: true,
            },
            {
              cellName: "D8",
              errorHint: "Feldbezeichnungen für Ergebnisse falsch D8",
              isConsequent: true,
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
          consequentErrorCell: [],
        },
      ],
      table: "Table1",
      result: true,
    },
  ],
};

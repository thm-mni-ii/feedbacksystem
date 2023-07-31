import { NestedTreeControl } from "@angular/cdk/tree";
import { Component } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import {
  ExcelCell,
  ExcelCheckResult,
  ExcelExercise,
} from "src/app/model/ExcelCheckResult";

@Component({
  selector: "app-excel-results",
  templateUrl: "./excel-results.component.html",
  styleUrls: ["./excel-results.component.scss"],
})
export class ExcelResultsComponent {
  displayedColumns = ["name", "cellName", "errorHint", "table", "passed"];
  dataSource = new MatTableDataSource<ExcelExercise>(EXCEL_DATA.exercises);
  treeDataSources: Record<string, MatTreeNestedDataSource<ExcelCell>> = {};

  treeControl = new NestedTreeControl<ExcelCell>(
    (node) => node.propagatedErrorCell
  );

  constructor() {
    EXCEL_DATA.exercises.forEach((e) => {
      this.treeDataSources[e.name] = new MatTreeNestedDataSource<ExcelCell>();
      this.treeDataSources[e.name].data = e.errorCell;
    });
  }

  hasChild = (_: number, node: ExcelCell) =>
    !!node.propagatedErrorCell && node.propagatedErrorCell.length > 0;
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
          propagatedErrorCell: [
            {
              cellName: "D7",
              errorHint: "Feldbezeichnungen für Ergebnisse falsch D7",
              isPropagated: true,
            },
            {
              cellName: "D8",
              errorHint: "Feldbezeichnungen für Ergebnisse falsch D8",
              isPropagated: true,
            },
          ],
        },
      ],
      sheet: "Table1",
      passed: false,
    },
    {
      name: "Übung 2  Kreis",
      errorCell: [
        {
          cellName: "B6",
          errorHint: "Feldbezeichnungen für Ergebnisse falsch",
          propagatedErrorCell: [],
        },
      ],
      sheet: "Table1",
      passed: true,
    },
  ],
};

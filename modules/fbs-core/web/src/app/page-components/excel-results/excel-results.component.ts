import { NestedTreeControl } from "@angular/cdk/tree";
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import {
  ExcelCell,
  ExcelCheckerResultData,
  ExcelExercise,
} from "src/app/model/ExcelCheckerResultData";

@Component({
  selector: "app-excel-results",
  templateUrl: "./excel-results.component.html",
  styleUrls: ["./excel-results.component.scss"],
})
export class ExcelResultsComponent implements OnChanges {
  displayedColumns = ["name", "cellName", "errorHint", "table", "passed"];
  dataSource = new MatTableDataSource<ExcelExercise>();
  treeDataSources: Record<string, MatTreeNestedDataSource<ExcelCell>> = {};

  @Input() resultData: ExcelCheckerResultData;

  treeControl = new NestedTreeControl<ExcelCell>(
    (node) => node.propagatedErrorCell
  );

  ngOnChanges(changes: SimpleChanges) {
    const currentItem = changes.resultData.currentValue;
    this.dataSource.data.push(...currentItem.exercises);
    this.resultData.exercises.forEach((e) => {
      this.treeDataSources[e.name] = new MatTreeNestedDataSource<ExcelCell>();
      this.treeDataSources[e.name].data = e.errorCell;
    });
  }

  hasChild = (_: number, node: ExcelCell) =>
    !!node.propagatedErrorCell && node.propagatedErrorCell.length > 0;
}

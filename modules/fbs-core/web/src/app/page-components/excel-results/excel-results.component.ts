import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ExcelCheckResult } from 'src/app/model/ExcelCheckResult';
import { Submission } from 'src/app/model/Submission';

@Component({
  selector: "app-excel-results",
  templateUrl: "./excel-results.component.html",
  styleUrls: ["./excel-results.component.scss"],
})
export class ExcelResultsComponent implements OnInit {
  dataSource = new MatTableDataSource<ExcelCheckResult>();
  columns = ["name", "identifier", "errorHint", "table", "succesfulAttempt"];
  tableViewAsGrid: boolean;
  index: number;
  allSubmissions: Submission[];

  constructor() {}

  ngOnInit(): void {}

  toggleTableView() {
    this.tableViewAsGrid = !this.tableViewAsGrid;
  }

  selectLast() {
    setTimeout(() => (this.index = this.allSubmissions.length), 1);
  }
}

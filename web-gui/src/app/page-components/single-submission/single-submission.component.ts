import {Component, Input, OnInit} from '@angular/core';
import {Submission} from "../../model/Submission";
import {MatTableDataSource} from "@angular/material/table";
import {CheckResult} from "../../model/CheckResult";

@Component({
  selector: 'app-single-submission',
  templateUrl: './single-submission.component.html',
  styleUrls: ['./single-submission.component.scss']
})
export class SingleSubmissionComponent implements OnInit {
  @Input() submission: Submission;

  columns = ['checkerType', 'resultText', 'exitCode'];
  dataSource = new MatTableDataSource<CheckResult>();

  constructor() { }

  ngOnInit(): void {
    this.dataSource.data = this.submission.results;
  }

}

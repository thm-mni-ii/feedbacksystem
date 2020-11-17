import {Component, Input} from '@angular/core';
import {Submission} from "../../model/Submission";
import {MatTableDataSource} from "@angular/material/table";
import {CheckResult} from "../../model/CheckResult";

@Component({
  selector: 'app-single-submission',
  templateUrl: './single-submission.component.html',
  styleUrls: ['./single-submission.component.scss']
})
export class SingleSubmissionComponent {
  columns = ['checkerType', 'resultText', 'exitCode'];
  dataSource = new MatTableDataSource<CheckResult>();

  @Input() set submission(sub: Submission) {
    this.dataSource.data = sub.results
  }
}

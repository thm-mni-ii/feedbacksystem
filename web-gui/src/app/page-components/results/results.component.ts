import {Component, Input, OnDestroy} from '@angular/core';
import {Submission} from '../../model/Submission';
import {MatTableDataSource} from '@angular/material/table';
import {CheckResult} from '../../model/CheckResult';
import {SubmissionService} from "../../service/submission.service";

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnDestroy {
  dataSource = new MatTableDataSource<CheckResult>();
  columns = ['checkerType', 'resultText', 'exitCode'];

  allSubmissions: Submission[];
  displayedSubmission: Submission;

  resultDataSource: MatTableDataSource<any>[] = [];
  resultColumns = [];

  expectedDataSource: MatTableDataSource<any>[] = [];
  expectedColumns = [];

  tableViewAsGrid = false;

  index: number;

  @Input() set submissions(submissions: Submission[]) {
    this.allSubmissions = submissions;
    this.selectLast();
    this.display(submissions[submissions.length - 1]);
  }

  @Input() displayTables: boolean;

  @Input() context: {uid: number, cid: number, tid: number};

  subscription: any;

  constructor(private submissionService: SubmissionService) {
    this.subscription = this.submissionService.getFileSubmissionEmitter()
      .subscribe(isFileSubmitted => {
        if(isFileSubmitted)
          this.selectLast();
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  handleSubmission(event): void {
    const submission = this.allSubmissions.find(item => this.allSubmissions.indexOf(item) == event.index);
    this.display(submission);
  }

  display(submission: Submission) {
    if (submission === undefined) {
      return;
    }
    this.displayedSubmission = submission;
    this.dataSource.data = submission.results;

    this.resultDataSource = [];
    this.resultColumns = [];
    this.expectedDataSource = [];
    this.expectedColumns = [];

    submission.results.forEach(res => {
      const extInfo: any = res.extInfo;
      if (extInfo && extInfo.type === 'compareTable') {
        this.resultColumns.push(extInfo.result.head);
        const resultSource = new MatTableDataSource<any>();
        resultSource.data = extInfo.result.rows;
        this.resultDataSource.push(resultSource);

        this.expectedColumns.push(extInfo.expected.head);
        const expectedSource = new MatTableDataSource<any>();
        expectedSource.data = extInfo.expected.rows;
        this.expectedDataSource.push(expectedSource);
      }
    });
  }

  toggleTableView() {
    this.tableViewAsGrid = !this.tableViewAsGrid;
  }

  selectLast() {
    setTimeout(() => (this.index = this.allSubmissions.length), 1);
  }
}

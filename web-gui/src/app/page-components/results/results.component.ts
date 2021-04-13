import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Submission} from '../../model/Submission';
import {MatTableDataSource} from '@angular/material/table';
import {CheckResult} from '../../model/CheckResult';
import {SubmissionService} from '../../service/submission.service';
import {AuthService} from '../../service/auth.service';
import {ActivatedRoute} from '@angular/router';
import {mergeMap} from 'rxjs/operators';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent {
  dataSource = new MatTableDataSource<CheckResult>();
  columns = ['checkerType', 'resultText', 'exitCode'];

  allSubmissions: Submission[];
  displayedSubmission: Submission;

  resultDataSource: MatTableDataSource<any>[] = [];
  resultColumns = [];

  expectedDataSource: MatTableDataSource<any>[] = [];
  expectedColumns = [];

  tableViewAsGrid = false;

  @Input() set submissions(subs: Submission[]) {
    this.allSubmissions = subs;
    this.display(subs[subs.length - 1]);
  }

  @Input() displayTables: boolean;

  @Input() allowRetry: boolean;
  @Output() retry = new EventEmitter<void>();

  constructor(private authService: AuthService, private submissionService: SubmissionService, private route: ActivatedRoute) {}

  display(submission: Submission) {
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

  start_retry() {
    this.route.params.pipe(
      mergeMap((params) => {
        console.log(params);
        const courseId = params.id;
        const taskId = params.tid;
        const token = this.authService.getToken();
        const retryID = this.displayedSubmission.id;
        return this.submissionService.restartSubmission(token.id, courseId, taskId, retryID);
      })
    ).subscribe(() => {
      this.retry.emit();
    });
  }
}

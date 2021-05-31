import {Component, Input} from '@angular/core';
import {Submission} from '../../model/Submission';
import {MatTableDataSource} from '@angular/material/table';
import {CheckResult} from '../../model/CheckResult';

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
}

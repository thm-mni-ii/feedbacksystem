import { Component, Input, OnInit } from "@angular/core";
import { Submission } from "../../model/Submission";
import { MatTableDataSource } from "@angular/material/table";
import { CheckResult } from "../../model/CheckResult";
import { SubmissionService } from "src/app/service/submission.service";

@Component({
  selector: "app-results",
  templateUrl: "./results.component.html",
  styleUrls: ["./results.component.scss"],
})
export class ResultsComponent implements OnInit {
  constructor(private submissionService: SubmissionService) {}

  ngOnInit(): void {
    const { uid, cid, tid } = this.context;
    this.submissionService
      .getAllSubmissions(uid, cid, tid)
      .subscribe((AllSubmissions) => {
        this.allSubmissions = AllSubmissions;
      });
  }

  dataSource = new MatTableDataSource<CheckResult>();
  columns = ["checkerType", "query", "resultText", "exitCode"];

  allSubmissions: Submission[];
  displayedSubmission: Submission;

  resultDataSource: MatTableDataSource<any>[] = [];
  resultColumns = [];

  expectedDataSource: MatTableDataSource<any>[] = [];
  expectedColumns = [];

  tableViewAsGrid = false;

  index: number;

  @Input() set submissions(submissions: Submission[]) {
    const lengthHasChanged = this.allSubmissions != submissions;
    this.allSubmissions = submissions;
    if (lengthHasChanged) {
      this.selectLast();
      this.display(submissions[submissions.length - 1]);
    }
  }

  @Input() displayTables: boolean;

  @Input() context: { uid: number; cid: number; tid: number };

  @Input() isText: Boolean;

  submissionContent: string;

  subscription: any;

  submission: Submission;

  handleSubmission(event): void {
    this.submission = this.allSubmissions.find(
      (item) => this.allSubmissions.indexOf(item) == event.index
    );
    this.getSubmissionContent(this.submission);
    this.display(this.submission);
  }

  getSubmissionContent(submission: Submission) {
    if (this.context !== undefined) {
      const { uid, cid, tid } = this.context;
      this.submissionService
        .getTaskSubmissionsContent(uid, cid, tid, submission.id)
        .subscribe((text) => (this.queryText = text));
    }
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

    submission.results.forEach((res) => {
      const extInfo: any = res.extInfo;
      if (extInfo && extInfo.type === "compareTable") {
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

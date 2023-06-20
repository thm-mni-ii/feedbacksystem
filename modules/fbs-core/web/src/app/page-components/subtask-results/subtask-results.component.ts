import { Component, Input } from "@angular/core";
import { Submission } from "../../model/Submission";
import { MatTableDataSource } from "@angular/material/table";
import { SubTaskResult } from "../../model/SubTaskResult";
import { SubmissionService } from "../../service/submission.service";

@Component({
  selector: "app-subtask-results",
  templateUrl: "./subtask-results.component.html",
  styleUrls: ["./subtask-results.component.scss"],
})
export class SubtaskResultsComponent {
  dataSource = new MatTableDataSource<SubTaskResult>();
  columns = ["name", "maxPoints", "points"];

  private _displayedSubmission: Submission;

  @Input()
  context: { uid: number; cid: number; tid: number };
  display = false;

  @Input()
  set displayedSubmission(submission: Submission) {
    if (submission === undefined) {
      return;
    }
    this._displayedSubmission = submission;
    const { uid, cid, tid } = this.context;
    this.submissionService
      .getSubTaskResults(uid, cid, tid, submission.id)
      .subscribe((stres) => {
        if (stres.length > 0) {
          this.display = true;
        }
        this.dataSource = new MatTableDataSource(stres);
      });
  }

  get displayedSubmission() {
    return this._displayedSubmission;
  }

  constructor(private submissionService: SubmissionService) {}
}

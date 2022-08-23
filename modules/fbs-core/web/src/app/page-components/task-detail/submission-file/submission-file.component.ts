import { Component, EventEmitter, Output } from "@angular/core";

@Component({
  selector: "app-submission-file",
  templateUrl: "./submission-file.component.html",
  styleUrls: ["./submission-file.component.scss"],
})
export class SubmissionFileComponent {
  @Output() update: EventEmitter<any> = new EventEmitter<any>();
  submissionFile: File[] = [];

  updateSubmissionFile(event) {
    this.submissionFile = event["content"];
    this.update.emit({ content: this.submissionFile });
  }
}

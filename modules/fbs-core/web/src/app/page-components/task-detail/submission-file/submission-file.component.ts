import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
} from "@angular/core";

@Component({
  selector: "app-submission-file",
  templateUrl: "./submission-file.component.html",
  styleUrls: ["./submission-file.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SubmissionFileComponent {
  @Output() update: EventEmitter<any> = new EventEmitter<any>();
  submissionFile: File[] = [];

  updateSubmissionFile(event) {
    this.submissionFile = event["content"];
    this.update.emit({ content: this.submissionFile });
  }
}

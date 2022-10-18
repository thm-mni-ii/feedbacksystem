import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-dropzone",
  templateUrl: "./dropzone.component.html",
  styleUrls: ["./dropzone.component.scss"],
})
export class DropzoneComponent {
  @Input() usage: String;
  @Input() submissionFile: File[] = [];
  @Output() update: EventEmitter<any> = new EventEmitter<any>();

  updateSubmissionFile(event) {
    this.submissionFile = event.addedFiles;
    this.update.emit({ content: this.submissionFile });
    // TODO: muss noch generisch gemacht werden
  }
}

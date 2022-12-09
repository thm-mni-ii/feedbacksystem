import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-submission-text",
  templateUrl: "./submission-text.component.html",
  styleUrls: ["./submission-text.component.scss"],
})
export class SubmissionTextComponent implements OnInit {
  toSubmit = "";
  @Input() title?: string;
  @Output() update: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  titleText: string = "Abgabe Text:";

  ngOnInit() {
    if (this.title != null) {
      this.titleText = this.title;
    }
  }

  updateSubmission(event) {
    this.update.emit({ content: event });
  }
}

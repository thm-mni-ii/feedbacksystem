import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-submission-text',
  templateUrl: './submission-text.component.html',
  styleUrls: ['./submission-text.component.scss']
})
export class SubmissionTextComponent {
  toSubmit: string = "";
  @Output() update: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  updateSubmission(event) {
    this.update.emit({content: event})
  }
}

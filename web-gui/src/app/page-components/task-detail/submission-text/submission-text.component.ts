import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CourseTask} from "../../../model/HttpInterfaces";

@Component({
  selector: 'app-submission-text',
  templateUrl: './submission-text.component.html',
  styleUrls: ['./submission-text.component.scss']
})
export class SubmissionTextComponent implements OnInit {
  toSubmit: string = "";
  @Output() update: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {

  }
  updateSubmission(event) {
      this.update.emit({content: this.toSubmit})
  }

}

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Task} from "../../../model/Task";

@Component({
  selector: 'app-submission-file',
  templateUrl: './submission-file.component.html',
  styleUrls: ['./submission-file.component.scss']
})
export class SubmissionFileComponent implements OnInit {
  @Input() task: Task;
  @Input() deadlineTask:any;

  @Output() update: EventEmitter<any> = new EventEmitter<any>();

  submissionFile: File[] = [];
  constructor() { }

  ngOnInit() {

  }

  updateSubmissionFile(event) {
    this.submissionFile = event['content'];
    this.update.emit({content: this.submissionFile})
  }
}

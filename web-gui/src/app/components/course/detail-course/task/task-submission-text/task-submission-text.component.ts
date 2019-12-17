import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CourseTask} from "../../../../../interfaces/HttpInterfaces";

@Component({
  selector: 'app-task-submission-text',
  templateUrl: './task-submission-text.component.html',
  styleUrls: ['./task-submission-text.component.scss']
})
export class TaskSubmissionTextComponent implements OnInit {
  @Input() task: CourseTask;
  @Input() deadlineTask:any;

  @Output() udapte: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {

  }

  updateSubmission(event){
    console.log("update", this.task.submission_data)
    this.udapte.emit({taskid: this.task.task_id, content: this.task.submission_data})
  }

}

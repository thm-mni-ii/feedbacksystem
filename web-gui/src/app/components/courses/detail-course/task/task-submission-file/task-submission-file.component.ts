import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CourseTask} from "../../../../../interfaces/HttpInterfaces";

@Component({
  selector: 'app-task-submission-file',
  templateUrl: './task-submission-file.component.html',
  styleUrls: ['./task-submission-file.component.scss']
})
export class TaskSubmissionFileComponent implements OnInit {
  @Input() task: CourseTask;
  @Input() deadlineTask:any;

  @Output() update: EventEmitter<any> = new EventEmitter<any>();
  @Output() trigger: EventEmitter<CourseTask> = new EventEmitter<CourseTask>();

  submissionFile: File[] = [];
  constructor() { }

  ngOnInit() {

  }
  triggerInfo(){
    this.trigger.emit(this.task)
  }

  updateSubmissionFile(event) {
    this.submissionFile = event.addedFiles
    this.update.emit({taskid: this.task.task_id, content: this.submissionFile})
  }
}

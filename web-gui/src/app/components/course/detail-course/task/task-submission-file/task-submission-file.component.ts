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
  @Output() triggerInfo: EventEmitter<CourseTask> = new EventEmitter<CourseTask>();
  // triggerExternalDescriptionIfNeeded(task, true)
  submissionFile: File;
  constructor() { }

  ngOnInit() {

  }
  updateSubmissionFile(file: File){
    this.submissionFile = file;
    this.update.emit({taskid: this.task.task_id, content: this.submissionFile})

  }
  trigger(){
    this.triggerInfo.emit(this.task)
  }
}

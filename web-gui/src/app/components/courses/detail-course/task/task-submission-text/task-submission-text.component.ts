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
  toSubmitt: string = "";

  @Output() update: EventEmitter<any> = new EventEmitter<any>();
  @Output() rerun: EventEmitter<CourseTask> = new EventEmitter<CourseTask>();
  @Output() trigger: EventEmitter<CourseTask> = new EventEmitter<CourseTask>();
  constructor() { }

  ngOnInit() {

  }
  triggerInfo(){
    this.trigger.emit(this.task)
  }
  reRunTask(){
    this.update.emit({taskid: this.task.task_id, content: this.task.submission_data})
    this.rerun.emit(this.task);
  }

  updateSubmission(event) {
    // more worse is not possible
    setTimeout(() => {
      console.log(this.toSubmitt)
      this.update.emit({taskid: this.task.task_id, content: this.toSubmitt})
    },1);
  }

}

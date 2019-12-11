import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CourseTask} from "../../../../../interfaces/HttpInterfaces";

@Component({
  selector: 'app-task-submission-choice',
  templateUrl: './task-submission-choice.component.html',
  styleUrls: ['./task-submission-choice.component.scss']
})
export class TaskSubmissionChoiceComponent implements OnInit {
  @Input() task: CourseTask;
  @Input() deadlineTask:any;

  submission: any;
  @Output() update: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {

  }

  parse(task: CourseTask){
    return [];
    // TODO only correct task use this component
    // return JSON.parse(task.external_description)
  }


  updateSubmission(data: any){
    this.update.emit({taskid: this.task.task_id, content: data})
  }

}

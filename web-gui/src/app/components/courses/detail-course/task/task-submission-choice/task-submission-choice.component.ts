import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CourseTask} from "../../../../../interfaces/HttpInterfaces";
import {MiscService} from "../../../../../service/misc.service";

@Component({
  selector: 'app-task-submission-choice',
  templateUrl: './task-submission-choice.component.html',
  styleUrls: ['./task-submission-choice.component.scss']
})
export class TaskSubmissionChoiceComponent implements OnInit {
  @Input() task: CourseTask;
  @Input() deadlineTask:any;

  @Output() update: EventEmitter<any> = new EventEmitter<any>();
  @Output() trigger: EventEmitter<CourseTask> = new EventEmitter<CourseTask>();
  @Output() rerun: EventEmitter<CourseTask> = new EventEmitter<CourseTask>();
  checkModel = [];
  submittedChoices = [];
  constructor(private misc: MiscService) { }

  ngOnInit() {
    this.checkModel = this.parse(this.task).map(v => {
      v["value"]=false;
      return v;
    });

    if(this.task.load_external_description){

      if(this.misc.isJSON(this.task.submission_data)) {
        let subMap = JSON.parse(this.task.submission_data);

        for (let key in Object.keys(subMap)){
          let val = subMap[key];

          let text = this.checkModel.filter(v => v["id"] == key)[0]["text"];
          this.submittedChoices.push({
            'id' : key,
            'text': text,
            'value': val
          })
        }
      }
    }

  }

  eventChange(id, payload){
    this.checkModel.filter(v => v["id"] == id)[0]["value"]=payload.checked;

    // create the submisison map
    let subMap = new Object();
    for (let key in this.checkModel) {
      let answer = this.checkModel[key];
      subMap[answer["id"]]=answer["value"];
    }

    this.update.emit({taskid: this.task.task_id, content: JSON.stringify(subMap)})
  }

  triggerInfo(){
    this.trigger.emit(this.task)
  }

  parse(task: CourseTask){
    if (!task.load_external_description) return [];
    return JSON.parse(task.external_description)
  }


  updateSubmission(data: any){
    this.update.emit({taskid: this.task.task_id, content: data})
  }

}

import {Component, Input, OnInit} from '@angular/core';
import {MatTabChangeEvent} from "@angular/material";
import {FormControl} from "@angular/forms";
import {CourseTaskEvaluation} from "../../../../interfaces/HttpInterfaces";

@Component({
  selector: 'app-task-result',
  templateUrl: './task-result.component.html',
  styleUrls: ['./task-result.component.scss']
})
export class TaskResultComponent implements OnInit {

  @Input() taskResults: CourseTaskEvaluation[];
  @Input() taskPassed: string;

  public taskResultList: any = [];

  constructor() {
    this.taskResultList = []
  }

  parseResultString(resultstring: string): any[]{
    if (resultstring == null) return []
    try {
      let obj = JSON.parse(resultstring)
      if (obj == null)
        return null
      else
        return obj
    } catch (e) {
      return [];
    }
  }

  ngOnInit() {
  }

  tabChanged(event: MatTabChangeEvent) {

  }
}

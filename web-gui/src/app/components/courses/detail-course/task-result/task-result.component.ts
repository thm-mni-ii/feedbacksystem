import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-task-result',
  templateUrl: './task-result.component.html',
  styleUrls: ['./task-result.component.scss']
})
export class TaskResultComponent implements OnInit {

  @Input() taskResult: string;
  @Input() taskPassed: string;

  public taskResultList: any = [];

  constructor() {

  }

  ngOnInit() {
    try {
      this.taskResultList = JSON.parse(this.taskResult)
    } catch (e) {
      // can not parsed, do nothing
      this.taskResultList = []
    }

  }

}

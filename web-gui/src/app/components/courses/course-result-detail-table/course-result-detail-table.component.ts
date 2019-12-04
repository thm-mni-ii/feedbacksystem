import {Component, Input, OnInit} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {CourseTaskEvaluation, TaskSubmission} from "../../../interfaces/HttpInterfaces";

@Component({
  selector: 'app-course-result-detail-table',
  templateUrl: './course-result-detail-table.component.html',
  styleUrls: ['./course-result-detail-table.component.scss']
})
export class CourseResultDetailTableComponent implements OnInit {

  @Input() taskSubmission: TaskSubmission;

  constructor() { }

  columns = ['result', 'choice_best_result_fit', 'result_date', 'testsystem_id', 'passed'];

  dataSource = new MatTableDataSource<CourseTaskEvaluation>();


  ngOnInit() {
    this.dataSource.data = this.taskSubmission.evaluation
  }

  parseDate(datestring){
    return new Date(datestring)
  }


}

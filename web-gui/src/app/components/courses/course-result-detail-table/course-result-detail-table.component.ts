import {Component, Input, OnInit} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {CourseTaskEvaluation, TaskSubmission} from "../../../interfaces/HttpInterfaces";
import {MiscService} from "../../../service/misc.service";

@Component({
  selector: 'app-course-result-detail-table',
  templateUrl: './course-result-detail-table.component.html',
  styleUrls: ['./course-result-detail-table.component.scss']
})
export class CourseResultDetailTableComponent implements OnInit {

  @Input() taskSubmission: TaskSubmission;

  constructor(private misc: MiscService) { }

  columns = ['submission_data', 'result', 'choice_best_result_fit', 'passed'];

  dataSource = new MatTableDataSource<CourseTaskEvaluation>();


  ngOnInit() {
    let evaluation = this.taskSubmission.evaluation;
    evaluation = evaluation.map(ev => {
      ev['submission_data'] = this.taskSubmission.submission_data;
      ev['filename'] = this.taskSubmission.filename;
      return ev;
    });

    this.dataSource.data = evaluation;
  }

  parseDate(datestring){
    return new Date(datestring)
  }

  isJSON(data: string){
    return this.misc.isJSON(data)
  }


}

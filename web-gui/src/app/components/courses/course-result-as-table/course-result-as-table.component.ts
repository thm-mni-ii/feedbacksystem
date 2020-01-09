import {Component, Input, OnInit} from '@angular/core';
import {TaskSubmission} from "../../../interfaces/HttpInterfaces";
import {MiscService} from "../../../service/misc.service";

@Component({
  selector: 'app-course-result-as-table',
  templateUrl: './course-result-as-table.component.html',
  styleUrls: ['./course-result-as-table.component.scss']
})
export class CourseResultAsTableComponent implements OnInit {
  @Input() data: string;
  dataTable: any[] = []

  constructor(private misc: MiscService) { }

  ngOnInit() {
    this.dataTable = JSON.parse(this.data)
  }

  get rows() {
    if(this.dataTable.length > 0){
      return this.misc.range(this.data.length);
    } else {
     return [];
    }
  }

}

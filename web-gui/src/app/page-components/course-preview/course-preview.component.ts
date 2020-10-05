import {Component, Input, OnInit} from '@angular/core';
import {TaskSubmission} from "../../model/HttpInterfaces";
import {MiscService} from "../../service/misc.service";


@Component({
  selector: 'app-course-preview',
  templateUrl: './course-preview.component.html',
  styleUrls: ['./course-preview.component.scss']
})
export class CoursePreviewComponent implements OnInit {
  @Input() data: string;
  dataTable: any[] = []

  constructor(private misc: MiscService) {
  }

  ngOnInit() {
    this.dataTable = JSON.parse(this.data)
  }

  get rows() {
    if (this.dataTable.length > 0) {
      return this.misc.range(this.data.length);
    } else {
      return [];
    }
  }
}

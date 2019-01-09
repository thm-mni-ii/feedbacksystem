import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material";

@Component({
  selector: 'app-student-course-dialog',
  templateUrl: './student-course-dialog.component.html',
  styleUrls: ['./student-course-dialog.component.scss']
})
export class StudentCourseDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}

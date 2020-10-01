import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DatabaseService} from "../../service/database.service";
import {CourseParameter, Succeeded} from "../../model/HttpInterfaces";

@Component({
  selector: 'app-parameter-course-modal',
  templateUrl: './parameter-course-modal.component.html',
  styleUrls: ['./parameter-course-modal.component.scss']
})
export class ParameterCourseModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ParameterCourseModalComponent>, private db: DatabaseService) { }

  parameterList: CourseParameter[] = [];

  ngOnInit() {
    this.loadParameters()
  }

  deleteCourseParam(courseid: number, key: string){
    this.db.deleteCourseParameter(courseid, key).then((data: Succeeded) => {
      this.loadParameters()
    }).catch()
  }

  loadParameters(){
    this.db.getAllCourseParameters(this.data.courseid).then((data: CourseParameter[]) => {
      console.log(data);
      this.parameterList = data
    }).catch()

  }

  saveParamList(){
    this.parameterList.forEach(parameter => {
      if(parameter.c_param_key) {
        this.db.addUpdateCourseParameter(this.data.courseid, parameter.c_param_key, parameter.c_param_desc)
      }

    });
    this.close(true)
  }

  close(exit: boolean) {
    this.dialogRef.close({exit: exit});
  }

}

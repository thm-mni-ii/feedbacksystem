import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DatabaseService} from "../../../../service/database.service";
import {CourseParameter, CourseParameterUser} from "../../../../interfaces/HttpInterfaces";

@Component({
  selector: 'app-course-parameter-user-modal',
  templateUrl: './course-parameter-user-modal.component.html',
  styleUrls: ['./course-parameter-user-modal.component.scss']
})
export class CourseParameterUserModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<CourseParameterUserModalComponent>, private db: DatabaseService) { }

  parameterList: CourseParameter[] = []
  parameterListUser : CourseParameterUser[] = []

  ngOnInit() {
    this.loadParameters()
  }

  /*deleteCourseParam(courseid: number, key: string){
    this.db.deleteCourseParameter(courseid, key).then((data: Succeeded) => {
      this.loadParameters()
    }).catch()
  }*/



  loadParameters(){
    this.db.getAllCourseParameters(this.data.courseid).then((data: CourseParameter[]) => {
      this.parameterList = data

      this.db.getAllCourseParametersOfUser(this.data.courseid).then((values: CourseParameterUser[]) => {
        this.parameterListUser = values

        this.parameterList.forEach(param => {
          let keys = this.parameterListUser.map(p => p.c_param_key)

          if(keys.indexOf(param.c_param_key) < 0){

            this.parameterListUser.push({
              c_param_key:param.c_param_key,
              value: '',
              course_id: param.course_id
            })
          }

        })
      })


    }).catch()

  }

  saveParamList(){
    this.parameterListUser.forEach(parameter => {
      if(parameter.c_param_key) {
        this.db.addUpdateCourseParameterUser(this.data.courseid, parameter.c_param_key, parameter.value)
      }
    })
    this.close(true)
  }



  close(exit: boolean) {
    this.dialogRef.close({exit: exit});
  }

}

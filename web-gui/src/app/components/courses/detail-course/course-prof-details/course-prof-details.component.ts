import { Component, OnInit } from '@angular/core';
import {flatMap} from "rxjs/operators";
import {
  CourseTask,
  CourseTaskEvaluation,
  DetailedCourseInformation,
  Succeeded, TaskSubmission
} from "../../../../interfaces/HttpInterfaces";
import {DatabaseService} from "../../../../service/database.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TitlebarService} from "../../../../service/titlebar.service";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../../service/user.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-course-prof-details',
  templateUrl: './course-prof-details.component.html',
  styleUrls: ['./course-prof-details.component.scss']
})
export class CourseProfDetailsComponent implements OnInit {

  constructor(private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService,
              private dialog: MatDialog, private user: UserService, private snackbar: MatSnackBar,
              private router: Router) {

  }

  taskid: number;
  userid: string;
  taskResults: CourseTaskEvaluation[];
  taskPassed: string;
  taskDetails: CourseTask = {} as CourseTask;


  ngOnInit() {
    this.route.params.pipe(
      flatMap(params => {
        this.taskid = parseInt(params['taskid']);
        this.userid = params['userid'];
        return this.db.getTaskResult(this.taskid)
      })).subscribe(
      (result: CourseTask) => {
        // Handle result
        this.taskDetails = result;


        this.db.getSubmissionsOfUserOfTask(this.taskDetails.course_id, this.userid, this.taskid).subscribe(
          (value: TaskSubmission[]) => {
            if(value.length > 0){
              let submission: TaskSubmission = value[value.length - 1]

              this.taskResults = submission.evaluation;
              this.taskPassed = submission.plagiat_passed
            } else {
              this.taskPassed = false;
            }

          }
        )


      },
      error => {
        console.log(error)

      },
    );
  }



  markAsPassed(){
    console.log(this.taskResults[0].submission_id)
    this.db.markTaskAsPassed(this.taskid, this.taskResults[0].submission_id).subscribe(
      (value: Succeeded) => {
        if(value.success){
          this.db.getTaskResult(this.taskid).subscribe(
            result => {
              this.taskDetails = result;
              this.taskResults = result.evaluation;
              this.taskPassed = result.combined_passed
            }
          )
        }
      },
      error => {}
    )
  }
}

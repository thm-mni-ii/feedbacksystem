import { Component, OnInit } from '@angular/core';
import {flatMap} from "rxjs/operators";
import {
  CourseTask,
  CourseTaskEvaluation,
  DetailedCourseInformation,
  Succeeded
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
        this.taskResults = result.evaluation;
        this.taskPassed = result.combined_passed
      },
      error => {
        console.log(error)

      },
    );
  }



  markAsPassed(task: CourseTask){
    console.log(task.evaluation[0].submission_id)
    this.db.markTaskAsPassed(task.task_id, task.evaluation[0].submission_id).subscribe(
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

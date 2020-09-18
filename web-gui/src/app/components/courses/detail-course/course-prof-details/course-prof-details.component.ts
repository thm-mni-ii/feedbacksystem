import {Component, OnInit} from '@angular/core';
import {flatMap} from "rxjs/operators";
import {
  CourseTask,
  CourseTaskEvaluation,
  Succeeded, TaskExtension, TaskSubmission
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
  userid: number;
  taskResults: CourseTaskEvaluation[];
  taskPassed: string = null;
  taskDetails: CourseTask = {} as CourseTask;
  submissionExist: boolean = false;
  taskExtensions: TaskExtension[];

  ngOnInit() {
    this.route.params.pipe(
      flatMap(params => {
        this.taskid = parseInt(params['taskid']);
        this.userid = parseInt(params['userid']);
        return this.db.getTaskResult(this.taskid)
      })).subscribe(
      (result: CourseTask) => {
        // Handle result
        this.taskDetails = result;

        this.loadUsersSubmission()

      },
      error => {
        console.log(error)

      },
    );
  }

  private combinedPassed(passedList) {
    if (passedList.indexOf(false) >= 0) {
      return 'false'
    } else if (passedList.indexOf(null) >= 0) {
      return null
    } else {
      return 'true'
    }
  }

  public downloadExtendedTaskInfo(taskInfo: TaskExtension){
    this.db.downloadExtendedTaskInfo(taskInfo)
  }

  loadUsersSubmission() {
    this.db.getSubmissionsOfUserOfTask(parseInt(this.taskDetails.course_id), this.userid, this.taskid).subscribe(
      (data: Object) => {
        let value: TaskSubmission[] = data['submissions'];
        this.taskExtensions = data['extended'];

        if (value.length > 0) {
          this.submissionExist = true;
          let submission: TaskSubmission = null;
          value.forEach((sub, index) => {
            let summedPassed = this.combinedPassed(sub.evaluation.map((eva: CourseTaskEvaluation) => eva.passed));
            if ('true' === summedPassed) {
              submission = sub;
            }
          });

          if (submission === null) {
            submission = value[0]
          }

          this.taskResults = submission.evaluation;
          let passedList = this.taskResults.map((eva: CourseTaskEvaluation) => eva.passed);
          this.taskPassed = this.combinedPassed(passedList)

        } else {
          this.submissionExist = false;
          this.taskPassed = '' + false;
        }
      }
    )
  }


  markAsPassed() {
    if (!this.submissionExist) {
      return
    }
    this.db.markTaskAsPassed(this.taskid, this.taskResults[0].submission_id).subscribe(
      (value: Succeeded) => {
        if (value.success) {
          setTimeout(() => {this.loadUsersSubmission()}, 1000);
        }
      },
      error => {
      }
    )
  }
}

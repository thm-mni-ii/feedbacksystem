import {Component, Inject, OnInit} from '@angular/core';
import {DatabaseService} from "../../../service/database.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TitlebarService} from "../../../service/titlebar.service";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../service/user.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DomSanitizer} from "@angular/platform-browser";
import {DOCUMENT} from "@angular/common";
import {
  CourseTask,
  DetailedCourseInformation,
  NewTaskInformation,
  Succeeded
} from "../../../interfaces/HttpInterfaces";
import {NewtaskDialogComponent} from "../detail-course/newtask-dialog/newtask-dialog.component";
import {NewconferenceDialogComponent} from "../detail-course/newconference-dialog/newconference-dialog.component";
import {delay, flatMap, retryWhen, take} from "rxjs/operators";
import {AnswerFromTestsystemDialogComponent} from "../modals/answer-from-testsystem-dialog/answer-from-testsystem-dialog.component";
import {of, throwError} from "rxjs";
import {UpdateCourseDialogComponent} from "../detail-course/update-course-dialog/update-course-dialog.component";

@Component({
  selector: 'app-course-tasks-overview',
  templateUrl: './course-tasks-overview.component.html',
  styleUrls: ['./course-tasks-overview.component.scss']
})
export class CourseTasksOverviewComponent implements OnInit {

  constructor(private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService,
              private dialog: MatDialog, private user: UserService, private snackbar: MatSnackBar, private sanitizer: DomSanitizer,
              private router: Router, @Inject(DOCUMENT) document) {
  }

  tasks: CourseTask[] = [];
  courseID: number;
  userRole: string;
  courseDetail: DetailedCourseInformation;

  ngOnInit() {
    this.route.params.subscribe(
      param => {
        this.courseID = param.id;
        this.loadTasksFromCourse(param.id)
      }
    );
  }

  loadTasksFromCourse(courseid: number) {
    this.db.getCourseDetail(courseid).subscribe((value: DetailedCourseInformation) => {
      this.courseDetail = value;
      this.tasks = value.tasks;
      this.userRole = value.role_name;
    })
  }

  public isAuthorized(){
    return ["tutor", "docent", "moderator", "admin"].indexOf(this.userRole) >= 0;
  }

  /**
   * Opens dialog to update course information
   */
  updateCourse() {
    this.dialog.open(UpdateCourseDialogComponent, {
      height: '600px',
      width: '800px',
      data: {data: this.courseDetail}
    }).afterClosed().subscribe((value: Succeeded) => {
      location.hash = ''
      if (value.success) {
        this.db.getCourseDetail(this.courseID).subscribe(courses => {
          this.courseDetail = courses;
          this.titlebar.emitTitle(this.courseDetail.course_name);
        });
      }
    });
  }

  createTask() {
    this.dialog.open(NewtaskDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {courseID: this.courseID}
    }).afterClosed().pipe(
      flatMap((value) => {
        if (value.success) {
          this.snackbar.open('Erstellung der Aufgabe erfolgreich', 'OK', {duration: 3000});
          this.waitAndDisplayTestsystemAcceptanceMessage(value.taskid)
        }
        return this.db.getCourseDetailOfTask(this.courseID, value.taskid);
      })
    ).subscribe(course_detail => {
      this.router.navigate(['courses', this.courseID,'task',course_detail.task.task_id])
    });
  }

  createConference() {
    this.dialog.open(NewconferenceDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {courseID: this.courseID}
    })
  }

  private waitAndDisplayTestsystemAcceptanceMessage(taskid: number) {
    setTimeout(() => {
      this.db.getTaskResult(taskid).pipe(
        flatMap((taskResult: NewTaskInformation) => {
          let acceptance_flaggs = (taskResult.testsystems.map(t => t.test_file_accept))

          if (acceptance_flaggs.indexOf(null) < 0) {
            this.dialog.open(AnswerFromTestsystemDialogComponent, {data: taskResult})
            return of({success: true})
          } else {
            return throwError('Not all results yet');
          }
        }),
        retryWhen(errors => errors.pipe(
          delay(5000),
          take(50)))
      ).toPromise()
        .then(d => {
          if (typeof d == 'undefined') {
            this.dialog.open(AnswerFromTestsystemDialogComponent, {data:{no_reaction:true}})
          }
        })
        .catch(console.error)
    }, 2000)
  }
}

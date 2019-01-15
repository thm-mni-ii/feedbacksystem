import {Component, OnInit} from '@angular/core';
import {delay, flatMap, map, mergeMap, retry, retryWhen, take} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {TitlebarService} from '../../../service/titlebar.service';
import {CourseTask, DetailedCourseInformation, Testsystem} from '../../../interfaces/HttpInterfaces';
import {DatabaseService} from '../../../service/database.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {NewtaskDialogComponent} from './newtask-dialog/newtask-dialog.component';
import {UserService} from '../../../service/user.service';
import {ExitCourseComponent} from './exit-course/exit-course.component';
import {Observable, of, throwError, timer} from 'rxjs';

@Component({
  selector: 'app-detail-course',
  templateUrl: './detail-course.component.html',
  styleUrls: ['./detail-course.component.scss']
})
export class DetailCourseComponent implements OnInit {


  constructor(private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService,
              private dialog: MatDialog, private user: UserService, private snackbar: MatSnackBar,
              private router: Router) {
  }

  courseDetail: DetailedCourseInformation;
  courseTasks: CourseTask[];
  submissionData: File | string;
  processing: boolean;
  userRole: string;
  submissionAsFile: boolean;


  ngOnInit() {
    this.userRole = this.user.getUserRole();

    this.route.params.pipe(
      flatMap(params => {
        const id = +params['id'];
        return this.db.getCourseDetail(id);
      })
    ).subscribe(course_detail => {
      this.courseDetail = course_detail;
      this.courseTasks = course_detail.tasks;
      this.titlebar.emitTitle(course_detail.course_name);
    });
  }

  createTask(course: DetailedCourseInformation) {
    this.dialog.open(NewtaskDialogComponent, {
      height: '400px',
      width: '600px',
      data: {courseID: course.course_id}
    }).afterClosed()
      .subscribe(result => {
        console.log(result);
      });
  }

  getSubmissionFile(file: File) {
    this.submissionData = file;
  }


  submission(courseID: number, currentTask: CourseTask) {
    this.db.submitTask(currentTask.task_id, this.submissionData).subscribe(res => {
      if (res.success) {
        this.processing = true;

        this.db.getTaskResult(currentTask.task_id).pipe(
          flatMap(value => {
            console.log(value);
            if (value.passed == null || typeof value.passed === undefined) {
              return throwError('No result yet');
            }
            return of(value);
          }),
          retryWhen(errors => errors.pipe(delay(10000), take(10)))
        ).subscribe(taskResult => {
          this.processing = false;
          const oldTask = this.courseTasks[this.courseTasks.indexOf(currentTask)];
          console.log(oldTask);
          console.log(taskResult);
        });

      }
    });

  }

  exitCourse(courseName: string, courseID: number) {
    this.dialog.open(ExitCourseComponent, {
      data: {coursename: courseName}
    }).afterClosed().pipe(
      flatMap(value => {
        console.log(value);
        if (value.exit) {
          return this.db.unsubscribeCourse(courseID);
        }
      })
    ).subscribe(res => {
      console.log(res);
      if (res.success) {
        this.snackbar.open('Du hast den Kurs ' + courseName + ' verlassen', 'OK', {duration: 3000});
        this.router.navigate(['courses', 'user']);
      }
    });
  }

}

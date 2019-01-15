import {Component, OnInit} from '@angular/core';
import {delay, flatMap, retryWhen, take} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {TitlebarService} from '../../../service/titlebar.service';
import {CourseTask, DetailedCourseInformation, Succeeded} from '../../../interfaces/HttpInterfaces';
import {DatabaseService} from '../../../service/database.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {NewtaskDialogComponent} from './newtask-dialog/newtask-dialog.component';
import {UserService} from '../../../service/user.service';
import {ExitCourseComponent} from './exit-course/exit-course.component';
import {of, throwError} from 'rxjs';

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

  /**
   * Creates a new task in course with dialog
   * @param course The course data for dialog
   */
  createTask(course: DetailedCourseInformation) {
    this.dialog.open(NewtaskDialogComponent, {
      height: '400px',
      width: '600px',
      data: {courseID: course.course_id}
    }).afterClosed().pipe(
      flatMap((value: Succeeded) => {
        if (value.success) {
          this.snackbar.open('Erstellung der Aufgabe erfolgreich', 'OK', {duration: 3000});
        }
        return this.db.getCourseDetail(course.course_id);
      })
    ).subscribe(course_detail => {
      this.courseTasks = course_detail.tasks;
    });


  }

  /**
   * Docent updates task
   * @param task
   */
  updateTask(task: CourseTask) {
    this.dialog.open(NewtaskDialogComponent, {
      height: '400px',
      width: '600px',
      data: {
        task: task
      }
    }).afterClosed().pipe(
      flatMap((value: Succeeded) => {
        if (value.success) {
          this.snackbar.open('Update der Aufgabe ' + task.task_name + ' erfolgreich', 'OK', {duration: 3000});
        }
        return this.db.getCourseDetail(this.courseDetail.course_id);
      })
    ).subscribe(course_detail => {
      this.courseTasks = course_detail.tasks;
    });
  }

  /**
   * Docent deletes task
   * @param task
   */
  deleteTask(task: CourseTask) {
    this.db.deleteTask(task.task_id).pipe(
      flatMap(value => {
        if (value.success) {
          this.snackbar.open('Aufgabe ' + task.task_name + ' wurde gelöscht', 'OK', {duration: 3000});
        }
        return this.db.getCourseDetail(this.courseDetail.course_id);
      })
    ).subscribe(course_detail => {
      this.courseTasks = course_detail.tasks;
    });
  }

  /**
   * Get file user wants to submit
   * @param file The file user submits
   */
  getSubmissionFile(file: File) {
    this.submissionData = file;
  }


  /**
   * Submission of user solution
   * @param courseID Current course
   * @param currentTask The current task for submission
   */
  submission(courseID: number, currentTask: CourseTask) {
    this.db.submitTask(currentTask.task_id, this.submissionData).subscribe(res => {
      if (res.success) {
        this.processing = true;

        this.db.getTaskResult(currentTask.task_id).pipe(
          flatMap(value => {
            if (value.passed == null || typeof value.passed === undefined) {
              return throwError('No result yet');
            }
            return of(value);
          }),
          retryWhen(errors => errors.pipe(delay(10000), take(10)))
        ).subscribe(taskResult => {
          this.processing = false;
          this.courseTasks[this.courseTasks.indexOf(currentTask)] = taskResult;
        });

      }
    });

  }

  /**
   * Unsubscribe course
   * @param courseName The name to show user
   * @param courseID The id of current course
   */
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

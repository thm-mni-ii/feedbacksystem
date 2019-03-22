import {AfterViewChecked, Component, Inject, OnInit} from '@angular/core';
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

import {UpdateCourseDialogComponent} from './update-course-dialog/update-course-dialog.component';
import {DOCUMENT} from '@angular/common';

/**
 * Shows a course in detail
 */
@Component({
  selector: 'app-detail-course',
  templateUrl: './detail-course.component.html',
  styleUrls: ['./detail-course.component.scss']
})
export class DetailCourseComponent implements OnInit, AfterViewChecked {


  constructor(private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService,
              private dialog: MatDialog, private user: UserService, private snackbar: MatSnackBar,
              private router: Router, @Inject(DOCUMENT) document) {
  }

  courseDetail: DetailedCourseInformation = <DetailedCourseInformation>{};
  courseTasks: CourseTask[];
  userRole: string;
  submissionData: { [task: number]: File | string };
  processing: { [task: number]: boolean };
  submissionAsFile: { [task: number]: boolean };
  deadlineTask: { [task: number]: boolean };
  courseID: number;

  hasScrolledToTask: boolean = false;


  private reachedDeadline(now: Date, deadline: Date): boolean {
    return now > deadline;
  }

  ngOnInit() {
    this.submissionAsFile = {};
    this.processing = {};
    this.submissionData = {};
    this.deadlineTask = {};


    // Get course id from url and receive data
    this.route.params.pipe(
      flatMap(params => {
        this.courseID = +params['id'];
        return this.db.getCourseDetail(this.courseID);
      })
    ).subscribe(course_detail => {
      this.courseDetail = course_detail;
      this.courseTasks = course_detail.tasks;

      this.userRole = course_detail.role_name;

      course_detail.tasks.forEach(task => {
        this.submissionAsFile[task.task_id] = false;
        this.processing[task.task_id] = false;
      });
      this.titlebar.emitTitle(course_detail.course_name);
    });

    // Check if task reached deadline
    setInterval(() => {
      if (this.courseTasks) {
        this.courseTasks.forEach(task => {
            if (task.deadline) {
              this.deadlineTask[task.task_id] = this.reachedDeadline(new Date(), new Date(task.deadline));
            }
          }
        );
      }
    }, 1000);
  }


  ngAfterViewChecked() {
    // If url fragment with task id is given, scroll to that task
    this.route.fragment.subscribe(taskIDScroll => {
      const elem = document.getElementById(taskIDScroll);
      if (elem && !this.hasScrolledToTask) {
        elem.scrollIntoView();
        this.hasScrolledToTask = true;
      }
    });
  }

  private submitTask(currentTask: CourseTask) {
    this.processing[currentTask.task_id] = true;
    this.db.submitTask(currentTask.task_id, this.submissionData[currentTask.task_id]).subscribe(res => {
      this.submissionData[currentTask.task_id] = '';
      if (res.success) {
        this.db.getTaskResult(currentTask.task_id).pipe(
          flatMap(taskResult => {
            this.courseTasks[this.courseTasks.indexOf(currentTask)] = taskResult;
            if (taskResult.passed == null || typeof taskResult.passed === undefined) {
              return throwError('No result yet');
            }
            return of(taskResult);
          }),
          retryWhen(errors => errors.pipe(
            delay(5000),
            take(120)))
        ).subscribe(taskResult => {
          this.processing[currentTask.task_id] = false;

          let index = -1
          for(let k in this.courseTasks){
            if(this.courseTasks[k].task_id == currentTask.task_id){
              index = parseInt(k); // stupid TS, it is an int, always will be
              break;
            }
          }
          this.courseTasks[index] = taskResult;
        });

      }
    });
  }

  /**
   * Opens dialog for creation of new task
   * @param course The course data for dialog
   */
  createTask(course: DetailedCourseInformation) {
    this.dialog.open(NewtaskDialogComponent, {
      height: 'auto',
      width: 'auto',
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
   * Opens dialog to update task
   * @param task The task to update
   */
  updateTask(task: CourseTask) {
    this.dialog.open(NewtaskDialogComponent, {
      height: 'auto',
      width: 'auto',
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
   * Opens snackbar and asks
   * if docent/tutor really wants to delete
   * this task
   * @param task The task that will be deleted
   */
  deleteTask(task: CourseTask) {
    this.snackbar.open(task.task_name + ' löschen ?', 'JA', {duration: 5000}).onAction().subscribe(() => {

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
    });

  }

  /**
   * Get file user wants to submit
   * @param file The file user submits
   * @param currentTask The current task to get file from
   */
  getSubmissionFile(file: File, currentTask: CourseTask) {
    this.submissionData[currentTask.task_id] = file;
  }


  /**
   * Submission of user solution
   * @param courseID Current course
   * @param currentTask The current task for submission
   */
  submission(courseID: number, currentTask: CourseTask) {
    if (this.submissionData[currentTask.task_id] == null) {
      this.snackbar.open('Sie haben keine Lösung für die Aufgabe ' + currentTask.task_name + ' abgegeben', 'Ups!');
      return;
    }

    // if user submits but there is a pending submission
    if (currentTask.submit_date && !currentTask.result_date) {
      this.snackbar.open('Für Aufgabe "' + currentTask.task_name +
        '" wird noch auf ein Ergebnis gewartet, trotzdem abgeben ?', 'Ja', {duration: 10000})
        .onAction()
        .subscribe(() => {
          this.submitTask(currentTask);
        });
    } else {
      this.submitTask(currentTask);
    }
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
        if (value.exit) {
          return this.db.unsubscribeCourse(courseID);
        }
      })
    ).subscribe(res => {
      if (res.success) {
        this.snackbar.open('Du hast den Kurs ' + courseName + ' verlassen', 'OK', {duration: 3000});
        this.router.navigate(['courses', 'user']);
      }
    });
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
      if (value.success) {
        this.db.getCourseDetail(this.courseID).subscribe(courses => {
          this.courseDetail = courses;
          this.titlebar.emitTitle(this.courseDetail.course_name);
        });
      }
    });
  }

  /**
   * If user gets course directly from link
   */
  subscribeCourse() {
    this.db.subscribeCourse(this.courseID).pipe(
      flatMap(success => {
        if (success.success) {
          this.snackbar.open('Kurs ' + this.courseDetail.course_name + ' beigetreten', 'OK', {duration: 3000});
          return this.db.getCourseDetail(this.courseID);
        }
      })
    ).subscribe(courseDetail => {
      this.courseDetail = courseDetail;
      this.courseTasks = courseDetail.tasks;
    });
  }

}

import {Component, Inject, OnInit} from '@angular/core';
import {DatabaseService} from '../../../service/database.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TitlebarService} from '../../../service/titlebar.service';
import {MatDialog} from '@angular/material/dialog';
import {UserService} from '../../../service/user.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DomSanitizer} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';
import { first } from 'rxjs/operators'
import {
  CourseTask,
  DetailedCourseInformation,
  NewTaskInformation,
  Succeeded, User
} from '../../../interfaces/HttpInterfaces';
import {NewtaskDialogComponent} from '../detail-course/newtask-dialog/newtask-dialog.component';
import {NewconferenceDialogComponent} from '../detail-course/newconference-dialog/newconference-dialog.component';
import {delay, flatMap, retryWhen, take} from 'rxjs/operators';
import {AnswerFromTestsystemDialogComponent} from '../modals/answer-from-testsystem-dialog/answer-from-testsystem-dialog.component';
import {of, throwError} from 'rxjs';
import {UpdateCourseDialogComponent} from '../detail-course/update-course-dialog/update-course-dialog.component';
import {ConferenceService} from '../../../service/conference.service';
import {Observable, Subscription} from 'rxjs';
import {NewticketDialogComponent} from '../detail-course/newticket-dialog/newticket-dialog.component';
import {IncomingCallDialogComponent} from '../detail-course/incoming-call-dialog/incoming-call-dialog.component';
import {ClassroomService} from '../../../service/classroom.service';
import {DeleteCourseModalComponent} from '../modals/delete-course-modal/delete-course-modal.component';

@Component({
  selector: 'app-course-tasks-overview',
  templateUrl: './course-tasks-overview.component.html',
  styleUrls: ['./course-tasks-overview.component.scss']
})
export class CourseTasksOverviewComponent implements OnInit {

  constructor(private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService,
              private conferenceService: ConferenceService, private classroomService: ClassroomService,
              private dialog: MatDialog, private user: UserService, private snackbar: MatSnackBar, private sanitizer: DomSanitizer,
              private router: Router, @Inject(DOCUMENT) document) {
  }

  tasks: CourseTask[] = [];
  courseID: number;
  userRole: string;
  courseDetail: DetailedCourseInformation;
  openConferences: Observable<string[]>;

  ngOnInit() {
    this.route.params.subscribe(
      param => {
        this.courseID = param.id;
        this.loadTasksFromCourse(param.id);

      }
    );
  }

  loadTasksFromCourse(courseid: number) {
    this.db.getCourseDetail(courseid).subscribe((value: DetailedCourseInformation) => {
      this.courseDetail = value;
      this.tasks = value.tasks;
      this.userRole = value.role_name;
    });
  }

  public isAuthorized() {
    return this.user.isTutorInCourse(this.courseID) || this.user.isDocentInCourse(this.courseID);
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
      location.hash = '';
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
          this.waitAndDisplayTestsystemAcceptanceMessage(value.taskid);
        }
        return this.db.getCourseDetailOfTask(this.courseID, value.taskid);
      })
    ).subscribe(course_detail => {
      this.router.navigate(['courses', this.courseID, 'task', course_detail.task.task_id]);
    });
  }

  createConference() {
    this.dialog.open(NewconferenceDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {courseID: this.courseID}
    });
  }

  openUrlInNewWindow(url: string) {
    window.open(url, '_blank');
  }

  private waitAndDisplayTestsystemAcceptanceMessage(taskid: number) {
    setTimeout(() => {
      this.db.getTaskResult(taskid).pipe(
        flatMap((taskResult: NewTaskInformation) => {
          const acceptance_flaggs = (taskResult.testsystems.map(t => t.test_file_accept));
          if (acceptance_flaggs.indexOf(null) < 0) {
            this.dialog.open(AnswerFromTestsystemDialogComponent, {data: taskResult});
            return of({success: true});
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
            this.dialog.open(AnswerFromTestsystemDialogComponent, {data: {no_reaction: true}});
          }
        })
        .catch(console.error);
    }, 2000);
  }

  goOnline() {
    this.db.subscribeCourse(this.courseID).subscribe();
    Notification.requestPermission();
    this.classroomService.getInvitations().subscribe(n => {
      this.dialog.open(IncomingCallDialogComponent, {
        height: 'auto',
        width: 'auto',
        data: {courseID: this.courseID, invitation: n},
        disableClose: true
      }).afterClosed().subscribe(hasAccepted => {

      });
    });
    this.classroomService.join(this.courseID);
    this.router.navigate(['courses', this.courseID, 'tickets']);
  }

  goOffline() {
    this.classroomService.leave();
  }

  createTicket() {
    this.dialog.open(NewticketDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {courseID: this.courseID}
    }).afterClosed().subscribe(ticket => {
      if (ticket) {
        this.classroomService.createTicket(ticket);
      }
    });
  }

  /**
   * Delete a course by its ID, if the user not permitted to do that, nothing happens
   */
  deleteCourse() {
    this.dialog.open(DeleteCourseModalComponent, {
      data: {coursename: this.courseDetail.course_name, courseID: this.courseID}
    }).afterClosed().pipe(
      flatMap(value => {
        if (value.exit) {
          return this.db.deleteCourse(this.courseID);
        }
      })
    )
      .toPromise()
      .then( (value: Succeeded) => {
        if (value.success) {
          this.snackbar.open('Kurs mit der ID ' + this.courseID + ' wurde ausgetragen', 'OK', {duration: 5000});
        } else {
          this.snackbar.open('Leider konnte der Kurs ' + this.courseID
            + ' nicht ausgetragen werden. Dieser Kurs scheint nicht zu existieren.',
            'OK', {duration: 5000});
        }
      })
      .catch(() => {
        this.snackbar.open('Leider konnte der Kurs ' + this.courseID
          + ' nicht ausgetragen werden. Wahrscheinlich hast du keine Berechtigung',
          'OK', {duration: 5000});
      });
  }
}

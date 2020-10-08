import {Component, Inject, OnInit} from '@angular/core';
import {DatabaseService} from '../../service/database.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TitlebarService} from '../../service/titlebar.service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DomSanitizer} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';
import {first, share, delay, flatMap, retryWhen, take} from 'rxjs/operators';
import {of, throwError, Observable, Subscription} from 'rxjs';

import {
  NewTaskInformation,
  Succeeded
} from '../../model/HttpInterfaces';
import {ConferenceService} from '../../service/conference.service';
import {ClassroomService} from '../../service/classroom.service';

import {TaskNewDialogComponent} from "../../dialogs/task-new-dialog/task-new-dialog.component";
import {NewconferenceDialogComponent} from "../../dialogs/newconference-dialog/newconference-dialog.component";
import {CourseUpdateDialogComponent} from "../../dialogs/course-update-dialog/course-update-dialog.component";
import {NewticketDialogComponent} from "../../dialogs/newticket-dialog/newticket-dialog.component";
import {IncomingCallDialogComponent} from "../../dialogs/incoming-call-dialog/incoming-call-dialog.component";
import {CourseDeleteModalComponent} from "../../dialogs/course-delete-modal/course-delete-modal.component";
import {ExitCourseDialogComponent} from "../../dialogs/exit-course-dialog/exit-course-dialog.component";
import {AuthService} from "../../service/auth.service";
import {Roles} from "../../model/Roles";
import {TaskService} from "../../service/task.service";
import {Course} from "../../model/Course";
import {Task} from "../../model/Task";
import {CourseService} from "../../service/course.service";
import {Submission} from "../../model/Submission";
import {UserService} from "../../service/user.service";
import {JWTToken} from "../../model/JWTToken";
import {error} from "@angular/compiler/src/util";

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnInit {

  constructor(private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService,
              private conferenceService: ConferenceService, private classroomService: ClassroomService,
              private dialog: MatDialog, private auth: AuthService, private snackbar: MatSnackBar, private sanitizer: DomSanitizer,
              private router: Router, private taskService: TaskService, private authService: AuthService,
              private courseService: CourseService, @Inject(DOCUMENT) document) {
  }

  tasks: Task[];
  courseID: number;
  user: string;
  courseDetail: Course;
  token: JWTToken;
  role: [];
  openConferences: Observable<string[]>;
  subscriptions: Subscription[] = [];
  submissionStatus: boolean;
  submissions: Submission[];

  ngOnInit() {
    this.route.params.subscribe(
      param => {
        this.courseID = param.id;
        this.loadAllInitalInformation();
      }
    );
  }

  loadAllInitalInformation() {
    this.taskService.getAllTasks(this.courseID).subscribe(
      tasks => {
        this.tasks = tasks;
      }
    );
    this.courseService.getCourse(this.courseID).subscribe(
      course => {
        this.courseDetail = course;
        this.titlebar.emitTitle(course.name);
    })
    this.token = this.authService.getToken()
    // this.role = this.authService.getToken().courseRoles;
    //TODO: only show role, if user has multiple courseRoles
    //0: docent, 1: tutor, 2: user
  }

  public isAuthorized() {
    // const courseRole = this.auth.getToken().courseRoles[this.courseID] // TODO: identify through Token
    return true //Roles.CourseRole.isDocent(courseRole) || Roles.CourseRole.isTutor(courseRole)
  }

  /**
   * Opens dialog to update course information
   */
  updateCourse() {
    this.dialog.open(CourseUpdateDialogComponent, {
      width: '50%',
      data: {data: this.courseDetail}
    }).afterClosed().subscribe((value: Succeeded) => {
      location.hash = '';
      if (value.success) {
        /*this.db.getCourseDetail(this.courseID).subscribe(courses => {
          this.courseDetail = courses;
          this.titlebar.emitTitle(this.courseDetail.course_name);
        });*/
        this.courseService.getCourse(this.courseID).subscribe((courses => {
          this.courseDetail = courses;
          this.titlebar.emitTitle(this.courseDetail.name);
        }))
      }
    });
  }

  createTask() {
    this.dialog.open(TaskNewDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {courseID: this.courseID}
    }).afterClosed().pipe(
      flatMap((value) => {
        if (value.success) {
          this.snackbar.open('Erstellung der Aufgabe erfolgreich', 'OK', {duration: 3000});
        }
        //return this.db.getCourseDetailOfTask(this.courseID, value.taskid);
        return this.taskService.getTask(this.courseID, value.taskid)
      })
    ).subscribe(courseDetail => {
      this.router.navigate(['courses', this.courseID, 'task', this.courseDetail.id]);
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

  /*private waitAndDisplayTestsystemAcceptanceMessage(taskid: number) {
    setTimeout(() => {
      this.db.getTaskResult(taskid).pipe(
        flatMap((taskResult: NewTaskInformation) => {
          const acceptance_flaggs = (taskResult.testsystems.map(t => t.test_file_accept));
          if (acceptance_flaggs.indexOf(null) < 0) {
            // this.dialog.open(AnswerFromTestsystemDialogComponent, {data: taskResult});
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
            // this.dialog.open(AnswerFromTestsystemDialogComponent, {data: {no_reaction: true}});
          }
        })
        .catch(console.error);
    }, 2000);
  }*/

  goOnline() {
    this.db.subscribeCourse(this.courseID).subscribe(); // TODO: why?
    Notification.requestPermission();
    this.classroomService.subscribeIncomingCalls(this.classroomService.getInvitations().subscribe(n => {
      this.dialog.open(IncomingCallDialogComponent, {
        height: 'auto',
        width: 'auto',
        data: {courseID: this.courseID, invitation: n},
        disableClose: true
      }).afterClosed().subscribe(hasAccepted => {

      });
    }));
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
        this.dialog.open(CourseDeleteModalComponent, {
          data: {coursename: this.courseDetail.name, courseID: this.courseID}
        }).afterClosed().pipe(
          flatMap(value => {
            if (value.exit) {
              return this.courseService.deleteCourse(this.courseID);
            }
          })
        )
          .toPromise()
          .then( (value: Succeeded) => {
            if (value.success) {
              this.snackbar.open('Kurs mit der ID ' + this.courseID + ' wurde gelöscht', 'OK', {duration: 5000});
              this.router.navigate(['courses', 'user']);
            } else {
              this.snackbar.open('Leider konnte der Kurs ' + this.courseID
                + ' nicht gelöscht werden. Dieser Kurs scheint nicht zu existieren.',
                'OK', {duration: 5000});
            }
          })
          .catch(() => {
            this.snackbar.open('Leider konnte der Kurs ' + this.courseID
              + ' nicht gelöscht werden. Wahrscheinlich hast du keine Berechtigung',
              'OK', {duration: 5000});
          });
      }

    subscribeCourse(){
    this.courseService.subscribeCourse(this.courseDetail.id, this.token.id).subscribe(
      res => {
        if (res){
          // TODO: reload token?
          // this.role = "USER"
          this.snackbar.open("Du bist dich für " + this.courseDetail.name + " eingetragen.", "ok", {duration: 3000})
        } else {
          this.snackbar.open("Es ist ein Fehler aufgetreten.", "ok", {duration: 3000})
        }
      }
    )
    }

    /**
      * Unsubscribe course
    */
    unsubscribeCourse() {
      this.dialog.open(ExitCourseDialogComponent, {
        data: {coursename: this.courseDetail.name}
      }).afterClosed().pipe(
        flatMap(value => {
          if (value.exit) {
            return this.courseService.unsubscribeCourse(this.courseDetail.id, this.token.id);
          }
        })
      ).subscribe(res => {
        if (res) {
          this.snackbar.open('Du hast den Kurs ' + this.courseDetail.name + ' verlassen', 'OK', {duration: 3000});
          this.router.navigate(['courses', 'user']);
        } else this.snackbar.open("Es ist ein Fehler aufgetreten.", "ok", {duration: 3000})
      }), error => this.snackbar.open("Es ist ein Fehler aufgetreten.", "ok", {duration: 3000})
    }

    public exportSubmissions() {
      this.db.exportCourseSubmissions(this.courseID, this.courseDetail.name);
    }
}

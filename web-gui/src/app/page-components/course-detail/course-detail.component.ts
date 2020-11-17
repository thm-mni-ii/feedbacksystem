import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TitlebarService} from '../../service/titlebar.service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DomSanitizer} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';
import {flatMap} from 'rxjs/operators';
import {of, Observable} from 'rxjs';

import {ConferenceService} from '../../service/conference.service';
import {ClassroomService} from '../../service/classroom.service';

import {TaskNewDialogComponent} from "../../dialogs/task-new-dialog/task-new-dialog.component";
import {NewconferenceDialogComponent} from "../../dialogs/newconference-dialog/newconference-dialog.component";
import {CourseUpdateDialogComponent} from "../../dialogs/course-update-dialog/course-update-dialog.component";
import {NewticketDialogComponent} from "../../dialogs/newticket-dialog/newticket-dialog.component";
import {AuthService} from "../../service/auth.service";
import {Roles} from "../../model/Roles";
import {TaskService} from "../../service/task.service";
import {Course} from "../../model/Course";
import {Task} from "../../model/Task";
import {CourseService} from "../../service/course.service";
import {CourseRegistrationService} from "../../service/course-registration.service";
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnInit {
  courseID: number;
  tasks: Task[]
  role: string = null
  course: Observable<Course> = of()

  constructor(private taskService: TaskService,
              private authService: AuthService,
              private route: ActivatedRoute, private titlebar: TitlebarService,
              private conferenceService: ConferenceService, private classroomService: ClassroomService,
              private dialog: MatDialog, private auth: AuthService, private snackbar: MatSnackBar, private sanitizer: DomSanitizer,
              private router: Router,
              private courseService: CourseService, private courseRegistrationService: CourseRegistrationService,
              @Inject(DOCUMENT) document) {
  }

  ngOnInit() {
    this.route.params.subscribe(
      param => {
        this.courseID = param.id;
        this.reloadCourse()
        this.reloadTasks()
      }
    );
    this.role = this.auth.getToken().courseRoles[this.courseID]
  }

  private reloadCourse() {
    this.course = this.courseService.getCourse(this.courseID)
    this.course.subscribe(course => {
      this.titlebar.emitTitle(course.name)
    })
    this.courseRegistrationService.getRegisteredCourses(this.authService.getToken().id)
      .subscribe(course => {
        let c = course.find(c => c.id == this.courseID)
        if (c && !this.role) {
          this.role = 'STUDENT'
        }
      })
  }

  reloadTasks() {
    this.taskService.getAllTasks(this.courseID).subscribe(tasks => this.tasks = tasks)
  }

  updateCourse() {
    this.courseService.getCourse(this.courseID).pipe(flatMap(course =>
      this.dialog.open(CourseUpdateDialogComponent, {
        width: '50%',
        data: {course: course, isUpdateDialog: true}
      }).afterClosed()
    )).subscribe((res) => {
      if (res.success) {
        this.reloadCourse()
      }
    });
  }

  createTask() {
    this.dialog.open(TaskNewDialogComponent, {
      height: 'auto',
      width: '50%',
      data: {courseId: this.courseID}
    }).afterClosed()
      .subscribe(result => {
        if (result.success) {
          this.router.navigate(['courses', this.courseID, 'task', result.task.id]);
        }
      }, error => console.error(error))
  }

  /**
   * Join a course by registering into it.
   */
  joinCourse() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {title: "Kurs beitreten?", message: 'Wollen Sie diesem Kurs beitreten?'}
    }).afterClosed()
      .subscribe(confirmed => {
        if (confirmed) {
          this.courseRegistrationService.registerCourse( this.authService.getToken().id, this.courseID)
            .subscribe(ok => this.ngOnInit(), error => console.error(error))
        }
      })
  }

  /**
   * Leave the course by de-registering from it.
   */
  exitCourse() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {title: "Kurs verlassen?", message: 'Wollen Sie diesen Kurs verlassen? Alle ihre Abgaben könnten verloren gehen!'}
    }).afterClosed()
      .subscribe(confirmed => {
        this.courseRegistrationService.deregisterCourse(this.authService.getToken().id, this.courseID)
          .subscribe(ok => {this.router.navigate(['/courses'])}, error => console.error(error))
      })
  }

  public isAuthorized(ignoreTutor: boolean = false) {
    const token = this.auth.getToken()
    const courseRole = token.courseRoles[this.courseID]
    const globalRole = token.globalRole
    return Roles.GlobalRole.isAdmin(globalRole) || Roles.GlobalRole.isModerator(globalRole)
      || Roles.CourseRole.isDocent(courseRole) || (Roles.CourseRole.isTutor(courseRole) && !ignoreTutor)
  }

  // Conferences

  openConferences: Observable<string[]>;

  createConference() {
    this.dialog.open(NewconferenceDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {courseID: this.courseID}
    });
  }

  joinClassroom() {
    // this.db.subscribeCourse(this.courseID).subscribe(); // TODO: why?
    this.classroomService.join(this.courseID);
    this.router.navigate(['courses', this.courseID, 'tickets']);
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

  deleteCourse() {
    this.course.subscribe(course => {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: "Kurs Löschen",
          message: `Kurs ${course.name} wirklich löschen? (Alle zugehörigen Aufgaben werden damit auch gelöscht!)`
        }
      }).afterClosed().pipe(
        flatMap(confirmed => {
          if (confirmed) {
            return this.courseService.deleteCourse(this.courseID);
          } else {
            return of()
          }
        })
      ).subscribe(ok => {
        this.router.navigate(['courses']);
      }, error => console.error(error))
    })
  }

  //
  // user: string;
  // courseDetail: Course;
  // token: JWTToken;
  // role: [];
  // openConferences: Observable<string[]>;
  // subscriptions: Subscription[] = [];
  // submissionStatus: boolean;
  // submissions: Submission[];
  //
  //
  //
  // loadAllInitalInformation() {
  //   this.taskService.getAllTasks(this.courseID).subscribe(
  //     tasks => {
  //       this.tasks = tasks;
  //     }
  //   );
  //   this.courseService.getCourse(this.courseID).subscribe(
  //     course => {
  //       this.courseDetail = course;
  //       this.titlebar.emitTitle(course.name);
  //   })
  //   this.role = this.authService.getToken().courseRoles;
  //
  //   //TODO: only show role, if user has multiple courseRoles
  //   //0: docent, 1: tutor, 2: user
  // }
  //
  // public isAuthorized() {
  //   const token = this.auth.getToken()
  //   const courseRole = token.courseRoles[this.courseID]
  //   const globalRole = token.globalRole
  //   return Roles.GlobalRole.isAdmin(globalRole) || Roles.GlobalRole.isModerator(globalRole)
  //     || Roles.CourseRole.isDocent(courseRole) || Roles.CourseRole.isTutor(courseRole)
  // }
  //
  // /**
  //  * Opens dialog to update course information
  //  */
  // updateCourse() {
  //   this.dialog.open(CourseUpdateDialogComponent, {
  //     width: '50%',
  //     data: {data: this.courseDetail}
  //   }).afterClosed().subscribe((value: Succeeded) => {
  //     location.hash = '';
  //     if (value.success) {
  //       /*this.db.getCourseDetail(this.courseID).subscribe(courses => {
  //         this.courseDetail = courses;
  //         this.titlebar.emitTitle(this.courseDetail.course_name);
  //       });*/
  //       this.courseService.getCourse(this.courseID).subscribe((courses => {
  //         this.courseDetail = courses;
  //         this.titlebar.emitTitle(this.courseDetail.name);
  //       }))
  //     }
  //   });
  // }
  //
  // createTask() {
  //   this.dialog.open(TaskNewDialogComponent, {
  //     height: 'auto',
  //     width: 'auto',
  //     data: {courseID: this.courseID}
  //   }).afterClosed().pipe(
  //     flatMap((value) => {
  //       if (value.success) {
  //         this.snackbar.open('Erstellung der Aufgabe erfolgreich', 'OK', {duration: 3000});
  //       }
  //       //return this.db.getCourseDetailOfTask(this.courseID, value.taskid);
  //       return this.taskService.getTask(this.courseID, value.taskid)
  //     })
  //   ).subscribe(courseDetail => {
  //     this.router.navigate(['courses', this.courseID, 'task', this.courseDetail.id]);
  //   });
  // }
  //
  // createConference() {
  //   this.dialog.open(NewconferenceDialogComponent, {
  //     height: 'auto',
  //     width: 'auto',
  //     data: {courseID: this.courseID}
  //   });
  // }
  //
  // openUrlInNewWindow(url: string) {
  //   window.open(url, '_blank');
  // }
  //
  // /*private waitAndDisplayTestsystemAcceptanceMessage(taskid: number) {
  //   setTimeout(() => {
  //     this.db.getTaskResult(taskid).pipe(
  //       flatMap((taskResult: NewTaskInformation) => {
  //         const acceptance_flaggs = (taskResult.testsystems.map(t => t.test_file_accept));
  //         if (acceptance_flaggs.indexOf(null) < 0) {
  //           // this.dialog.open(AnswerFromTestsystemDialogComponent, {data: taskResult});
  //           return of({success: true});
  //         } else {
  //           return throwError('Not all results yet');
  //         }
  //       }),
  //       retryWhen(errors => errors.pipe(
  //         delay(5000),
  //         take(50)))
  //     ).toPromise()
  //       .then(d => {
  //         if (typeof d == 'undefined') {
  //           // this.dialog.open(AnswerFromTestsystemDialogComponent, {data: {no_reaction: true}});
  //         }
  //       })
  //       .catch(console.error);
  //   }, 2000);
  // }*/
  //
  // goOnline() {
  //   this.db.subscribeCourse(this.courseID).subscribe(); // TODO: why?
  //   Notification.requestPermission();
  //   this.classroomService.subscribeIncomingCalls(this.classroomService.getConferences().subscribe(n => {
  //     this.dialog.open(IncomingCallDialogComponent, {
  //       height: 'auto',
  //       width: 'auto',
  //       data: {courseID: this.courseID, Conference: n},
  //       disableClose: true
  //     }).afterClosed().subscribe(hasAccepted => {
  //
  //     });
  //   }));
  //   this.classroomService.join(this.courseID);
  //   this.router.navigate(['courses', this.courseID, 'tickets']);
  // }
  //
  // goOffline() {
  //   this.classroomService.leave();
  // }
  //
  // createTicket() {
  //   this.dialog.open(NewticketDialogComponent, {
  //     height: 'auto',
  //     width: 'auto',
  //     data: {courseID: this.courseID}
  //   }).afterClosed().subscribe(ticket => {
  //     if (ticket) {
  //       this.classroomService.createTicket(ticket);
  //     }
  //   });
  // }
  //
  // /**
  //  * Delete a course by its ID, if the user not permitted to do that, nothing happens
  //  */
  // deleteCourse() {
  //       this.dialog.open(CourseDeleteModalComponent, {
  //         data: {coursename: this.courseDetail.name, courseID: this.courseID}
  //       }).afterClosed().pipe(
  //         flatMap(value => {
  //           if (value.exit) {
  //             return this.courseService.deleteCourse(this.courseID);
  //           }
  //         })
  //       )
  //         .toPromise()
  //         .then( (value: Succeeded) => {
  //           if (value.success) {
  //             this.snackbar.open('Kurs mit der ID ' + this.courseID + ' wurde gelöscht', 'OK', {duration: 5000});
  //             this.router.navigate(['courses', 'user']);
  //           } else {
  //             this.snackbar.open('Leider konnte der Kurs ' + this.courseID
  //               + ' nicht gelöscht werden. Dieser Kurs scheint nicht zu existieren.',
  //               'OK', {duration: 5000});
  //           }
  //         })
  //         .catch(() => {
  //           this.snackbar.open('Leider konnte der Kurs ' + this.courseID
  //             + ' nicht gelöscht werden. Wahrscheinlich hast du keine Berechtigung',
  //             'OK', {duration: 5000});
  //         });
  //     }
  //
  //   subscribeCourse(){
  //   this.courseRegistrationService.registerCourse(this.courseDetail.id, this.token.id).subscribe(
  //     res => {
  //       if (res){
  //         // TODO: reload token?
  //         // this.role = "USER"
  //         this.snackbar.open("Du bist dich für " + this.courseDetail.name + " eingetragen.", "ok", {duration: 3000})
  //       } else {
  //         this.snackbar.open("Es ist ein Fehler aufgetreten.", "ok", {duration: 3000})
  //       }
  //     }
  //   )
  //   }
  //
  //   /**
  //     * Unsubscribe course
  //   */
  //   unsubscribeCourse() {
  //     this.dialog.open(ExitCourseDialogComponent, {
  //       data: {coursename: this.courseDetail.name}
  //     }).afterClosed().pipe(
  //       flatMap(value => {
  //         if (value.exit) {
  //           return this.courseRegistrationService.deregisterCourse(this.courseDetail.id, this.token.id);
  //         }
  //       })
  //     ).subscribe(res => {
  //       if (res) {
  //         this.snackbar.open('Du hast den Kurs ' + this.courseDetail.name + ' verlassen', 'OK', {duration: 3000});
  //         this.router.navigate(['courses', 'user']);
  //       } else this.snackbar.open("Es ist ein Fehler aufgetreten.", "ok", {duration: 3000})
  //     }, error => this.snackbar.open("Es ist ein Fehler aufgetreten.", "ok", {duration: 3000}))
  //   }
  //
  //   public exportSubmissions() {
  //     this.db.exportCourseSubmissions(this.courseID, this.courseDetail.name);
  //   }
}

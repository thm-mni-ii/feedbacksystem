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
import {ConferenceService} from "../../../service/conference.service";
import {Observable} from 'rxjs';
import {RxStompClient} from "../../../util/rx-stomp";

@Component({
  selector: 'app-course-tasks-overview',
  templateUrl: './course-tasks-overview.component.html',
  styleUrls: ['./course-tasks-overview.component.scss']
})
export class CourseTasksOverviewComponent implements OnInit {

  private stompRx: RxStompClient = null;
  private connected = false;

  constructor(private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService,
              private conferenceService: ConferenceService,
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
        this.loadTasksFromCourse(param.id);
        this.loadConferences();
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
    }).afterClosed()
      .pipe(
        flatMap(numberOfConference =>
          this.conferenceService.createConferences(this.courseID, numberOfConference)
        )
      )
      .subscribe(e => {this.loadConferences()}, throwError);
  }

  openConferences: Observable<string[]>;

  private loadConferences() {
    this.openConferences = this.conferenceService.getConferences(this.courseID)
  }

  openUrlInNewWindow(url: string) {
    window.open(url,'_blank');
  }

  private waitAndDisplayTestsystemAcceptanceMessage(taskid: number) {
    setTimeout(() => {
      this.db.getTaskResult(taskid).pipe(
        flatMap((taskResult: NewTaskInformation) => {
          let acceptance_flaggs = (taskResult.testsystems.map(t => t.test_file_accept));
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
            this.dialog.open(AnswerFromTestsystemDialogComponent, {data:{no_reaction:true}})
          }
        })
        .catch(console.error);
    }, 2000);
  }

  goOnline() {
    this.stompRx = new RxStompClient('https://localhost:8080/websocket');

    this.stompRx.connect(this.constructHeaders()).subscribe(_ => {
      this.connected = true;

      // Handles invitation from tutors / docents to take part in a webconference
      this.stompRx.subscribeToTopic('/user/' + this.user.getUsername() + '/classroom/invite', this.constructHeaders()).subscribe(msg => {
        let invite = JSON.parse(msg.body);
        let participants = invite.users
          .map(u => u.prename + ' ' + u.surname)
          .push(invite.user.prename + ' ' + invite.user.surname);

        // TODO: replace the following by an angular dialog where the button action opens a
        // new link, otherwise the new window will be blocked by a strict ad-blocker.
        if (confirm('You are invited to take part in a webconference with ' + JSON.stringify(participants))) {
          this.openUrlInNewWindow(invite.href);
        }
      });
    });
  }

  goOffline() {
    this.stompRx.disconnect(this.constructHeaders()).subscribe(() => {
      this.connected = false;
    });
  }

  testAction() {
    this.sendInvite('https://fk-conf.mni.thm.de/andrej.html', [
      {
        'username': 'la19',
        'prename': 'Lena',
        'surname': 'Apfel'
      }
    ]);
  }

  sendInvite(href: string, users: {'username': string, 'prename': string, 'surname': string}[]) {
    this.stompRx.send('/websocket/classroom/invite', {'href': href, 'users': users}, this.constructHeaders());
  }

  private constructHeaders() {
    return {'Auth-Token': this.user.getPlainToken()};
  }
}

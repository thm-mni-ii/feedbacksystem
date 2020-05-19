import {Component, Inject, OnInit} from '@angular/core';
import {DatabaseService} from '../../../service/database.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TitlebarService} from '../../../service/titlebar.service';
import {ConferenceService} from '../../../service/conference.service';
import {MatDialog} from '@angular/material/dialog';
import {UserService} from '../../../service/user.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DomSanitizer} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';
import {GeneralCourseInformation, Ticket, User} from '../../../interfaces/HttpInterfaces';
import { Pipe, PipeTransform } from '@angular/core';
import {AssignTicketDialogComponent} from '../detail-ticket/assign-ticket-dialog/assign-ticket-dialog.component';
import {InvitetoConferenceDialogComponent} from '../detail-ticket/inviteto-conference-dialog/inviteto-conference-dialog.component';
import {Observable, Subscription, timer, interval, BehaviorSubject} from 'rxjs';
import {ClassroomService} from '../../../service/classroom.service';
import {UserRoles} from '../../../util/UserRoles';
import {NewticketDialogComponent} from '../detail-course/newticket-dialog/newticket-dialog.component';
import {NewconferenceDialogComponent} from '../detail-course/newconference-dialog/newconference-dialog.component';
import {first} from 'rxjs/operators';
import {IncomingCallDialogComponent} from '../detail-course/incoming-call-dialog/incoming-call-dialog.component';

@Component({
  selector: 'app-course-tickets-overview',
  templateUrl: './course-tickets-overview.component.html',
  styleUrls: ['./course-tickets-overview.component.scss']
})
export class CourseTicketsOverviewComponent implements OnInit {
  constructor(private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService,
              private conferenceService: ConferenceService, private classroomService: ClassroomService,
              private dialog: MatDialog, public user: UserService, private snackbar: MatSnackBar, private sanitizer: DomSanitizer,
              private router: Router, @Inject(DOCUMENT) document, private databaseService: DatabaseService) {
  }

  courseID: number;
  onlineUsers: Observable<User[]>;
  tickets: Observable<Ticket[]>;
  self: User;
  isCourseSubscriber: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  ngOnInit(): void {
    this.db.subscribeCourse(this.courseID);
    this.onlineUsers = this.classroomService.getUsers();
    this.tickets = this.classroomService.getTickets();
    this.route.params.subscribe(
      param => {
        this.courseID = param.id;
        this.db.getSubscribedCourses().subscribe(n => {
          const thisCourse: GeneralCourseInformation | undefined = n.find((course) => {
            course.course_id = this.courseID;
          });
          if (thisCourse) {
            this.isCourseSubscriber.next(true);
          }
        });
      });
    this.onlineUsers.subscribe(n => {
      this.self = n.find(u => {
        return u.username == this.user.getUsername();
      });
    });
    if (!this.classroomService.isJoined()) {
      this.goOnline();
    }
  }

  public isAuthorized() {
    return this.user.isTutorInCourse(this.courseID) || this.user.isDocentInCourse(this.courseID);
  }

  public inviteToConference(user) {
    this.dialog.open(InvitetoConferenceDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {user: user}
    });
  }

  public createConference() {
    this.dialog.open(NewconferenceDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {courseID: this.courseID}
    });
  }

  public assignTeacher(ticket) {
    this.dialog.open(AssignTicketDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {courseID: this.courseID, users: this.onlineUsers, ticket: ticket}
    });
  }

  public sortTickets(tickets) {
    return tickets.sort( (a, b) => {
      const username: String = this.user.getUsername();
      if (a.assignee.username === username && b.assignee.username === username) {
        return a.timestamp > b.timestamp ? 1 : -1;
      } else if (a.assignee.username === username) {
        return -1;
      } else if (b.assignee.username === username) {
        return 1;
      }
      return a.timestamp > b.timestamp ? 1 : -1;
    });
  }

  public sortUsers(users) {
    return users.sort((a, b) => {
      if (a.role > b.role) {
        return 1;
      } else if ( a.role < b.role) {
        return -1;
      } else {
        if (a.surname > b.surname) {
          return 1;
        } else {
          return -1;
        }
      }
    });
  }

  goOnline() {
    Notification.requestPermission();
    const subscription: Subscription = this.classroomService.getInvitations().subscribe(n => {
      this.dialog.open(IncomingCallDialogComponent, {
        height: 'auto',
        width: 'auto',
        data: {courseID: this.courseID, invitation: n},
        disableClose: true
      });
    });
    this.classroomService.join(this.courseID).subscribe();
  }

  goOffline() {
    this.classroomService.leave().subscribe();
    this.router.navigate(['courses', this.courseID]);
  }

  public getRoleName(roleid) {
    switch (roleid) {
      case UserRoles.Admin:
        return 'Admin';
      case UserRoles.Moderator:
        return 'Moderator';
      case UserRoles.Dozent:
        return 'Dozent';
      case UserRoles.Tutor:
        return 'Tutor';
      case UserRoles.Student:
        return 'Student';
    }
  }
  public createTicket() {
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
  openConference() {
    this.conferenceService.getSingleConferenceLink(this.conferenceService.selectedConferenceSystem.value).pipe(first()).subscribe(m => {
      const conferenceWindowHandle: Window = this.conferenceService.openWindowIfClosed(m);
      if (conferenceWindowHandle) {
        this.conferenceService.stopTimeout();
        const sub: Subscription = interval(5000).subscribe(_ => {
          if (!conferenceWindowHandle || conferenceWindowHandle.closed) {
            this.conferenceService.startTimeout();
            this.closeConference();
            sub.unsubscribe();
          }
        });
        this.classroomService.openConference(this.courseID, 'public');
      }
    });
  }

  shareConference() {
    this.classroomService.isInConference(this.self);
  }

  closeConference() {
    this.classroomService.closeConference(this.courseID);
  }

  joinConference(user: User) {
    const invitation = this.classroomService.getInvitationFromUser(user);
    let windowHandle: Window;
    if (invitation.service == 'bigbluebutton') {
      // tslint:disable-next-line:max-line-length
      this.conferenceService.getBBBConferenceInvitationLink(invitation.meetingId, invitation.meetingPassword)
        .pipe(first())
        .subscribe(n => {
          // @ts-ignore
          windowHandle = this.openUrlInNewWindow(n.href);
          this.classroomService.attendConference(invitation);
        });
    } else if (invitation.service == 'jitsi') {
      windowHandle = this.openUrlInNewWindow(invitation.href);
      this.classroomService.attendConference(invitation);
    }
    const sub = interval(5000).subscribe(_ => {
      if (!windowHandle || windowHandle.closed) {
        this.classroomService.departConference(invitation);
        sub.unsubscribe();
      }
    });
  }



  public openUrlInNewWindow(url: string): Window {
    return window.open(url, '_blank');
  }
}

@Pipe({
  name: 'ticketstatus',
  pure: false
})
export class TicketStatusFilter implements PipeTransform {
  transform(items: any[], filter: string): any {
    if (!items || !filter) {
      return items;
    }
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    return items.filter(item => item.creator.username !== item.assignee.username);
  }
}

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

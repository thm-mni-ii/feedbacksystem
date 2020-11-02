import {Component, Inject, OnInit} from '@angular/core';
import {DatabaseService} from '../../service/database.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TitlebarService} from '../../service/titlebar.service';
import {ConferenceService} from '../../service/conference.service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DomSanitizer} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';
import {Ticket, User} from '../../model/HttpInterfaces';
import {Observable, Subscription, timer, interval, BehaviorSubject} from 'rxjs';
import {ClassroomService} from '../../service/classroom.service';
import {NewticketDialogComponent} from "../../dialogs/newticket-dialog/newticket-dialog.component";
import {NewconferenceDialogComponent} from "../../dialogs/newconference-dialog/newconference-dialog.component";
import {AuthService} from "../../service/auth.service";
import {Roles} from "../../model/Roles";
import {InvitetoConferenceDialogComponent} from "../../dialogs/inviteto-conference-dialog/inviteto-conference-dialog.component";
import {AssignTicketDialogComponent} from "../../dialogs/assign-ticket-dialog/assign-ticket-dialog.component";


@Component({
  selector: 'app-conference',
  templateUrl: './conference.component.html',
  styleUrls: ['./conference.component.scss']
})
export class ConferenceComponent implements OnInit {
  constructor(private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService,
              private conferenceService: ConferenceService, private classroomService: ClassroomService,
              private dialog: MatDialog, public auth: AuthService, private snackbar: MatSnackBar, private sanitizer: DomSanitizer,
              private router: Router, @Inject(DOCUMENT) document) {
  }
  courseId: number;
  users: User[] = [];
  usersInConference: User[] = [];
  tickets: Observable<Ticket[]>;
  self: User;
  isCourseSubscriber: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscriptions: Subscription[] = [];
  username: string;

  conferenceWindowOpen: Boolean = false;

  ngOnInit(): void {
    this.username = this.auth.getToken().username
    this.tickets = this.classroomService.getTickets();
    this.route.params.subscribe(param => {
        this.courseId = param.id;
      });
    this.classroomService.getUsersInConference().subscribe((users) => {
      this.usersInConference = users;
    })
    this.classroomService.getUsers().subscribe((users) => {
      this.users = users;
    })
    if (!this.classroomService.isJoined()) {
      this.joinClassroom();
    }
    this.classroomService.getConferenceWindowHandle().subscribe(isOpen => {
      this.conferenceWindowOpen = isOpen
    })
  }

  public isAuthorized() {
    const courseRole = this.auth.getToken().courseRoles[this.courseId]
    return Roles.CourseRole.isDocent(courseRole) || Roles.CourseRole.isTutor(courseRole)
  }

  public inviteToConference(users) {
    this.dialog.open(InvitetoConferenceDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {users: users}
    });
  }

  public createConference() {
    this.dialog.open(NewconferenceDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {courseID: this.courseId}
    });
  }

  public assignTeacher(ticket) {
    this.dialog.open(AssignTicketDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {courseID: this.courseId, ticket: ticket}
    });
  }

  public sortTickets(tickets) {
    return tickets.sort( (a, b) => {
      const username: String = this.auth.getToken().username
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
      if (a.courseRole > b.courseRole) {
        return 1;
      } else if ( a.courseRole < b.courseRole) {
        return -1;
      } else {
        if (a.courseRole > b.courseRole) {
          return 1;
        } else {
          return -1;
        }
      }
    });
  }

  joinClassroom() {
    Notification.requestPermission();
    this.classroomService.join(this.courseId);
  }
  leaveClassroom() {
    this.classroomService.leave();
    this.router.navigate(['courses', this.courseId]);
  }
  public parseCourseRole(role: String): String{
    switch(role) {
      case "DOCENT": return "Dozent"
      case "TUTOR": return "Tutor"
      case "STUDENT": return "Student"
    }
  }
  public createTicket() {
    this.dialog.open(NewticketDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {courseID: this.courseId}
    }).afterClosed().subscribe(ticket => {
      if (ticket) {
        this.classroomService.createTicket(ticket);
      }
    });
  }
  public isInConference(user: User) {
    return this.usersInConference.filter(u => u.username == user.username).length != 0;
  }
  public isInConferenceName(username: string) {
    return this.usersInConference.filter(u => u.username == username).length != 0;
  }
  public isInClassroom(username: string) {
    return this.users.filter(u => u.username == username).length != 0;
  }
}

// @Pipe({
//   name: 'ticketstatus',
//   pure: false
// })
// export class TicketStatusFilter implements PipeTransform {
//   transform(items: any[], filter: string): any {
//     if (!items || !filter) {
//       return items;
//     }
//     // filter items array, items which match and return true will be
//     // kept, false will be filtered out
//     return items.filter(item => item.creator.username !== item.assignee.username);
//   }
// }
//
// @Pipe({ name: 'safe' })
// export class SafePipe implements PipeTransform {
//   constructor(private sanitizer: DomSanitizer) { }
//   transform(url) {
//     return this.sanitizer.bypassSecurityTrustResourceUrl(url);
//   }
// }

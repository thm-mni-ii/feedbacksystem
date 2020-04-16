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
import {Ticket, User} from '../../../interfaces/HttpInterfaces';
import { Pipe, PipeTransform } from '@angular/core';
import {AssignTicketDialogComponent} from '../detail-ticket/assign-ticket-dialog/assign-ticket-dialog.component';
import {InvitetoConferenceDialogComponent} from '../detail-ticket/inviteto-conference-dialog/inviteto-conference-dialog.component';
import {Observable} from 'rxjs';
import {ClassroomService} from '../../../service/classroom.service';
import {UserRoles} from '../../../util/UserRoles';

@Component({
  selector: 'app-course-tickets-overview',
  templateUrl: './course-tickets-overview.component.html',
  styleUrls: ['./course-tickets-overview.component.scss']
})
export class CourseTicketsOverviewComponent implements OnInit {
  constructor(private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService,
              private conferenceService: ConferenceService, private classroomService: ClassroomService,
              private dialog: MatDialog, private user: UserService, private snackbar: MatSnackBar, private sanitizer: DomSanitizer,
              private router: Router, @Inject(DOCUMENT) document) {
    this.confUrl = this.conferenceService.getSingleConferenceLink();
  }

  courseID: number;
  userRole: string;
  users: Observable<User[]>;
  tickets: Observable<Ticket[]>;
  confUrl: Observable<string>;
  roles = UserRoles;

  ngOnInit(): void {
    this.users = this.classroomService.getUsers();
    this.tickets = this.classroomService.getTickets();
     this.route.params.subscribe(
       param => {
         this.courseID = param.id;
       });
  }

  public isAuthorized() {
    return ['tutor', 'docent', 'moderator', 'admin'].indexOf(this.userRole) >= 0;
  }

  public inviteToConference(user) {
    this.dialog.open(InvitetoConferenceDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {user: user}
    });
  }

  public assignTeacher(ticket) {
    this.dialog.open(AssignTicketDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {courseID: this.courseID, users: this.users, ticket: ticket}
    });
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

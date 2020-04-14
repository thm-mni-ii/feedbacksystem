import {Component, Inject, OnInit} from '@angular/core';

import {DatabaseService} from "../../../service/database.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TitlebarService} from "../../../service/titlebar.service";
import {ConferenceService} from "../../../service/conference.service";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../service/user.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DomSanitizer} from "@angular/platform-browser";
import {DOCUMENT} from "@angular/common";
import {User} from "../../../interfaces/HttpInterfaces";
import { Pipe, PipeTransform } from '@angular/core';
import {NewconferenceDialogComponent} from "../detail-course/newconference-dialog/newconference-dialog.component";
import {flatMap} from "rxjs/operators";
import {throwError} from "rxjs";
import {AssignTicketDialogComponent} from "../detail-ticket/assign-ticket-dialog/assign-ticket-dialog.component";
import {InvitetoConferenceDialogComponent} from "../detail-ticket/inviteto-conference-dialog/inviteto-conference-dialog.component";

@Component({
  selector: 'app-course-tickets-overview',
  templateUrl: './course-tickets-overview.component.html',
  styleUrls: ['./course-tickets-overview.component.scss']
})
export class CourseTicketsOverviewComponent implements OnInit {


  constructor(private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService,
              private conferenceService: ConferenceService,
              private dialog: MatDialog, private user: UserService, private snackbar: MatSnackBar, private sanitizer: DomSanitizer,
              private router: Router, @Inject(DOCUMENT) document) {
  }

  courseID: number;
  userRole: string;
  users: User[];
  tickets: any[];

  ngOnInit(): void {
    this.users = [new class implements User {
      email: string = "";
      last_login: Date;
      prename: string = "Simon";
      role_id: number = 1;
      surname: string = "Schniedenharn";
      user_id: number = 1;
      username: string;
    }, new class implements User {
      email: string = "";
      last_login: Date;
      prename: string = "John";
      role_id: number = 5;
      surname: string = "Doe";
      user_id: number = 2;
      username: string;
    }, new class implements User {
        email: string = "";
        last_login: Date;
        prename: string = "Joanna";
        role_id: number = 16;
        surname: string = "Doe";
        user_id: number = 5;
        username: string;
      }]
    this.tickets = [{title: "Riesenproblem",
      desc: "Bitte hilfe bei dem Problem",
      status: "open",
      creator: "Simon, S",
      timestamp:1586340000,
      priority:5
    },
      {title: "Riesenproblem",
        desc: "Bitte hilfe bei dem Problem, komme alleine nicht mehr weiter. Warte auf Konferenzanfrage.",
        status: "open",
        creator: "Simon, S",
        timestamp:1586340000,
        priority:5},
      {title: "Riesenproblem",
        desc: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
        status: "inProgress", creator: "Stefan, B",
        timestamp:1586340000,
        assignee:"Tutor1",
        priority:5}]
    this.route.params.subscribe(
      param => {
        this.courseID = param.id;
      }
    );
  }

  public isAuthorized() {
    return ["tutor", "docent", "moderator", "admin"].indexOf(this.userRole) >= 0;
  }

  public inviteToConference(user) {
    this.dialog.open(InvitetoConferenceDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {user: user}
    })
  }

  public assignTeacher(ticket) {
    this.dialog.open(AssignTicketDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {courseID: this.courseID, users: this.users,ticket:ticket}
    })
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
    return items.filter(item => item.status == filter);
  }
}


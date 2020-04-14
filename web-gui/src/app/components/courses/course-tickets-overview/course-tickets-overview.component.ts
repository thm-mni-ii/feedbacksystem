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
import {AssignTicketDialogComponent} from "../detail-ticket/assign-ticket-dialog/assign-ticket-dialog.component";
import {InvitetoConferenceDialogComponent} from "../detail-ticket/inviteto-conference-dialog/inviteto-conference-dialog.component";
import {RxStompClient} from "../../../util/rx-stomp";
import {Observable} from 'rxjs';


@Component({
  selector: 'app-course-tickets-overview',
  templateUrl: './course-tickets-overview.component.html',
  styleUrls: ['./course-tickets-overview.component.scss']
})
export class CourseTicketsOverviewComponent implements OnInit {
  private stompRx: RxStompClient = null;
  connected:boolean;

  constructor(private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService,
              private conferenceService: ConferenceService,
              private dialog: MatDialog, private user: UserService, private snackbar: MatSnackBar, private sanitizer: DomSanitizer,
              private router: Router, @Inject(DOCUMENT) document) {
    this.users = this.router.getCurrentNavigation().extras.state.users;
  }

  courseID: number;
  userRole: string;
  users: Observable<User[]>;
  tickets: any[];

  ngOnInit(): void {
    //console.log(this.stompRx.send("/websocket/classroom/users",{courseId:this.courseID}))
    this.tickets = [{title: "Riesenproblem",
      desc: "Bitte hilfe bei dem Problem",
      status: "open",
      creator: "Simon, S",
      timestamp:1586340000,
      priority:6
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
  private constructHeaders() {
    return {'Auth-Token': this.user.getPlainToken()};
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


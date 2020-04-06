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
      user_id: number;
      username: string;
    },new class implements User {
      email: string = "";
      last_login: Date;
      prename: string = "John";
      role_id: number = 1;
      surname: string = "Doe";
      user_id: number;
      username: string;
    }]
    this.tickets = [{title:"Riesenproblem",desc:"Bitte hilfe bei dem Problem",status:"open"},
      {title:"Riesenproblem",desc:"Bitte hilfe bei dem Problem",status:"open"},
      {title:"Riesenproblem",desc:"Bitte hilfe bei dem Problem",status:"inProgress"}]
    this.route.params.subscribe(
      param => {
        this.courseID = param.id;
      }
    );
  }

  public isAuthorized(){
    return ["tutor", "docent", "moderator", "admin"].indexOf(this.userRole) >= 0;
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


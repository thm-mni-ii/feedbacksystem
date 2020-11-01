import {Component, Inject, OnInit, Pipe, PipeTransform} from '@angular/core';
import {Ticket, User} from '../../model/HttpInterfaces';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {interval, Observable} from 'rxjs';
import { first } from 'rxjs/operators';
import {UserService} from '../../service/user.service';
import {ClassroomService} from '../../service/classroom.service';
import {ConferenceService} from '../../service/conference.service';
import {AuthService} from "../../service/auth.service";
import {Roles} from "../../model/Roles";
import {UpdateCourseDialogComponent} from "../update-course-dialog/update-course-dialog.component";
import {CloseTicketDialogComponent} from "../close-ticket-dialog/close-ticket-dialog.component";

@Component({
  selector: 'app-assign-ticket-dialog',
  templateUrl: './assign-ticket-dialog.component.html',
  styleUrls: ['./assign-ticket-dialog.component.scss'],
  providers: [UserService]
})
export class AssignTicketDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<UpdateCourseDialogComponent>,
              private snackBar: MatSnackBar, private classroomService: ClassroomService,
              private conferenceService: ConferenceService, private auth: AuthService, private dialog: MatDialog) {
    this.users = this.data.users;
    this.ticket = this.data.ticket;
    this.courseID = this.data.courseID;
  }
  users: Observable<User[]>;
  ticket: Ticket;
  courseID: number;
  usersInConference: User[] = [];

  public assignTicket(assignee, ticket) {
      this.ticket.assignee = assignee;
      this.classroomService.updateTicket(ticket);
      this.snackBar.open(`${assignee.prename} ${assignee.surname} wurde dem Ticket als Bearbeiter zugewiesen`, 'OK', {duration: 3000});
      this.dialogRef.close();
    }

  ngOnInit(): void {
    this.classroomService.getUsersInConference().subscribe((users) => {
      this.usersInConference = users;
    })
  }
  public closeTicket(ticket) {
    this.classroomService.removeTicket(ticket);
    this.snackBar.open(`Das Ticket wurde geschlossen`, 'OK', {duration: 3000});
    this.dialogRef.close();
  }

  public isAuthorized() {
    const courseRole = this.auth.getToken().courseRoles[this.courseID]
    return Roles.CourseRole.isDocent(courseRole) || Roles.CourseRole.isTutor(courseRole)
  }

  public startCall(invitee) {
    this.classroomService.userInviter().pipe(first()).subscribe(() => {
      this.classroomService.inviteToConference(invitee);
    })
    this.classroomService.openConference()
    this.snackBar.open(`${invitee.prename} ${invitee.surname} wurde eingeladen der Konferenz beizutreten.`, 'OK', {duration: 3000});
    this.dialogRef.close();
  }
  public isInConference(user: User) {
    return this.usersInConference.filter(u => u.username == user.username).length != 0;
  }
  joinConference(user: User) {
    this.classroomService.joinConference(user)
  }
  public openUrlInNewWindow(url: string): Window {
    return window.open(url, '_blank');
  }
}

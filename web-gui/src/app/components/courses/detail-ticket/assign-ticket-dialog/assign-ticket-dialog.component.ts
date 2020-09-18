import {Component, Inject, OnInit, Pipe, PipeTransform} from '@angular/core';
import {ConferenceInvitation, Ticket, User} from '../../../../interfaces/HttpInterfaces';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {UpdateCourseDialogComponent} from '../../detail-course/update-course-dialog/update-course-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {interval, Observable} from 'rxjs';
import { first } from 'rxjs/operators';
import {UserService} from '../../../../service/user.service';
import {ClassroomService} from '../../../../service/classroom.service';
import {ConferenceService} from '../../../../service/conference.service';
import {CloseTicketDialogComponent} from '../close-ticket-dialog/close-ticket-dialog.component';

@Component({
  selector: 'app-assign-ticket-dialog',
  templateUrl: './assign-ticket-dialog.component.html',
  styleUrls: ['./assign-ticket-dialog.component.scss'],
  providers: [UserService]
})
export class AssignTicketDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<UpdateCourseDialogComponent>,
              private snackBar: MatSnackBar, private classroomService: ClassroomService,
              private conferenceService: ConferenceService, private user: UserService, private dialog: MatDialog) {
    this.users = this.data.users;
    this.ticket = this.data.ticket;
    this.courseID = this.data.courseID;
  }
  users: Observable<User[]>;
  ticket: Ticket;
  courseID: number;
  conferenceSystem: String;
  conferenceInvitation: ConferenceInvitation;

  public assignTicket = (function(assignee) {
    this.classroomService.getTickets().pipe(first()).subscribe(t => {
      this.ticket.assignee = assignee;
      this.classroomService.updateTicket(this.ticket);
      this.snackBar.open(`${assignee.prename} ${assignee.surname} wurde dem Ticket als Bearbeiter zugewiesen`, 'OK', {duration: 3000});
      this.dialogRef.close();
    });
  }).bind(this);

  public startCall = (function(invitee) {
    this.users.pipe(first()).subscribe(n => {
      const self = n.find(u => u.username == this.user.getUsername());
      if (self) {
        this.assignTicket(self);
      }
    });
    this.classroomService.getTickets().pipe(first()).subscribe(t => {
      this.conferenceService.getSingleConferenceLink(this.conferenceService.selectedConferenceSystem.value).pipe(first()).subscribe(m => {
        this.classroomService.inviteToConference(this.conferenceInvitation, [invitee]);
        this.conferenceService.openWindowIfClosed(m);
        this.snackBar.open(`${invitee.prename} ${invitee.surname} wurde eingeladen der Konferenz beizutreten.`, 'OK', {duration: 3000});
        this.dialogRef.close();
      });
    });
  }).bind(this);

  ngOnInit(): void {
    this.conferenceService.getSelectedConferenceSystem().subscribe(n => {
      this.conferenceSystem = n;
    });
    this.conferenceService.getConferenceInvitation().subscribe(n => {
      this.conferenceInvitation = n;
    });
  }
  public deleteAssignedDialog(user, cb) {
    this.classroomService.getTickets().pipe(first()).subscribe(t => {
      const hasAssignedTicket = t.find(ticket => {
        // @ts-ignore
        if (ticket.assignee && ticket.assignee.username) {
          // @ts-ignore
          return ticket.assignee.username == this.user.getUsername() && ticket.id != this.ticket.id;
        }
      });
      if (hasAssignedTicket) {
        this.dialog.open(CloseTicketDialogComponent, {
          height: 'auto',
          width: 'auto',
          data: {user: user},
        }).afterClosed().pipe(first()).subscribe( _ => cb(user));
      } else {
        cb(user);
      }
    });
  }
  public closeTicket(ticket) {
    this.classroomService.removeTicket(ticket);
    this.snackBar.open(`Das Ticket wurde geschlossen`, 'OK', {duration: 3000});
    this.dialogRef.close();
  }

  public isAuthorized() {
    return this.user.isTutorInCourse(this.courseID) || this.user.isDocentInCourse(this.courseID);
  }

  joinConference(user: User) {
    const invitation = this.classroomService.getInvitationFromUser(user);
    let windowHandle: Window;
    if (invitation.service == 'bigbluebutton') {
      // tslint:disable-next-line:max-line-length
      this.conferenceService.getBBBConferenceInvitationLink(invitation.meetingId, invitation.moderatorPassword)
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
  name: 'isTeacher',
  pure: false
})
export class UserTeacherFilter implements PipeTransform {
  transform(items: any[]): any {
    if (!items) {
      return items;
    }
    return items.filter(item => item.role <= 8);
  }
}

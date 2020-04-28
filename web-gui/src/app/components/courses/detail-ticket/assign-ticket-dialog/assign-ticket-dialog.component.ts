import {Component, Inject, OnInit, Pipe, PipeTransform} from '@angular/core';
import {Ticket, User} from '../../../../interfaces/HttpInterfaces';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UpdateCourseDialogComponent} from '../../detail-course/update-course-dialog/update-course-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Observable, Subject, BehaviorSubject} from 'rxjs';
import {UserService} from '../../../../service/user.service';
import {ClassroomService} from '../../../../service/classroom.service';
import {ConferenceService} from '../../../../service/conference.service';

@Component({
  selector: 'app-assign-ticket-dialog',
  templateUrl: './assign-ticket-dialog.component.html',
  styleUrls: ['./assign-ticket-dialog.component.scss']
})
export class AssignTicketDialogComponent implements OnInit {
  users: Observable<User[]>;
  ticket: Ticket;
  courseID: number;
  conferenceSystemObs: Observable<String>;
  conferenceSystem: String;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<UpdateCourseDialogComponent>,
              private snackBar: MatSnackBar, private classroomService: ClassroomService,
              private conferenceService: ConferenceService, private user: UserService) {
    this.users = this.data.users;
    this.ticket = this.data.ticket;
    this.courseID = this.data.courseID;
  }

  ngOnInit(): void {
    this.conferenceSystemObs = this.conferenceService.getSelectedConferenceSystem();
    this.conferenceSystemObs.subscribe(n => {
      this.conferenceSystem = n;
    });
  }

  public assignTicket(assignee) {
    this.ticket.assignee = assignee;
    this.classroomService.updateTicket(this.ticket);
    this.snackBar.open(`${assignee.prename} ${assignee.surname} wurde dem Ticket als Bearbeiter zugewiesen`, 'OK', {duration: 3000});
    this.dialogRef.close();
  }

  public closeTicket(ticket) {
    this.classroomService.removeTicket(ticket);
    this.snackBar.open(`Das Ticket wurde geschlossen`, 'OK', {duration: 3000});
    this.dialogRef.close();
  }

  public startCall(invitee) {
      if (this.conferenceSystem == 'jitsi') {
        this.conferenceService.getSingleConferenceLink('jitsi').subscribe(m => {
          this.classroomService.inviteToConference(m, [invitee]);
          this.conferenceService.openWindowIfClosed(m);
          this.snackBar.open(`${invitee.prename} ${invitee.surname} wurde eingeladen der Konferenz beizutreten.`, 'OK', {duration: 3000});
          this.dialogRef.close();
        });
      } else if (this.conferenceSystem == 'bigbluebutton') {
        this.conferenceService.getConferenceInvitationLinks('bigbluebutton').subscribe(m => {
          this.classroomService.inviteToConference(m.get('mod_href'), [invitee]);
          this.conferenceService.openWindowIfClosed(m.get('mod_href'));
          this.snackBar.open(`${invitee.prename} ${invitee.surname} wurde eingeladen der Konferenz beizutreten.`, 'OK', {duration: 3000});
          this.dialogRef.close();
        });
      }
    }

  public isAuthorized() {
    return this.user.isTutorInCourse(this.courseID) || this.user.isDocentInCourse(this.courseID);
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

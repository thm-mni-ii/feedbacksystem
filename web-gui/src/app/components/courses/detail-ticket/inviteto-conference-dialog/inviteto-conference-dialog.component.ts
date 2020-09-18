import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UpdateCourseDialogComponent} from '../../detail-course/update-course-dialog/update-course-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConferenceInvitation, User} from '../../../../interfaces/HttpInterfaces';
import {ConferenceService} from '../../../../service/conference.service';
import {ClassroomService} from '../../../../service/classroom.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import { first } from 'rxjs/operators';
import {ConferenceSystems} from '../../../../util/ConferenceSystems';
@Component({
  selector: 'app-inviteto-conference-dialog',
  templateUrl: './inviteto-conference-dialog.component.html',
  styleUrls: ['./inviteto-conference-dialog.component.scss']
})
export class InvitetoConferenceDialogComponent implements OnInit {
  invitee: User;
  form: FormGroup;

  conferenceSystem: string;
  conferenceInvitation: ConferenceInvitation;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<UpdateCourseDialogComponent>,
              private snackBar: MatSnackBar, private conferenceService: ConferenceService,
              private classroomService: ClassroomService, private _formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.invitee = this.data.user;
    this.conferenceService.getSelectedConferenceSystem().subscribe(n => {
      this.conferenceSystem = n;
    });
    this.conferenceService.getConferenceInvitation().subscribe(n => {
      this.conferenceInvitation = n;
    });
  }

  public startCall(invitee) {
    this.conferenceService.getSingleConferenceLink(this.conferenceService.selectedConferenceSystem.value).pipe(first()).subscribe(m => {
      this.classroomService.inviteToConference(this.conferenceInvitation, [invitee]);
      this.conferenceService.openWindowIfClosed(m);
      this.snackBar.open(`${invitee.prename} ${invitee.surname} wurde eingeladen der Konferenz beizutreten.`, 'OK', {duration: 3000});
      this.dialogRef.close();
    });
  }

  public cancelCall() {
    this.dialogRef.close();
  }

}

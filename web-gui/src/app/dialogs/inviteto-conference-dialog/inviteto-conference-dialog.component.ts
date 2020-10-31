import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConferenceConference, User} from '../../model/HttpInterfaces';
import {ConferenceService} from '../../service/conference.service';
import {ClassroomService} from '../../service/classroom.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import { first } from 'rxjs/operators';
import {ConferenceSystems} from '../../util/ConferenceSystems';
import {UpdateCourseDialogComponent} from "../update-course-dialog/update-course-dialog.component";
@Component({
  selector: 'app-inviteto-conference-dialog',
  templateUrl: './inviteto-conference-dialog.component.html',
  styleUrls: ['./inviteto-conference-dialog.component.scss']
})
export class InvitetoConferenceDialogComponent implements OnInit {
  invitees: User[];
  form: FormGroup;

  conferenceSystem: string;
  conferenceConference: ConferenceConference;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<UpdateCourseDialogComponent>,
              private snackBar: MatSnackBar, private conferenceService: ConferenceService,
              private classroomService: ClassroomService, private _formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.invitees = this.data.users;
  }

  public startCall(invitee) {
      this.classroomService.userInviter().pipe(first()).subscribe(() => {
        this.classroomService.inviteToConference(invitee);
      })
      this.classroomService.openConference()
      this.snackBar.open(`${invitee.prename} ${invitee.surname} wurde eingeladen der Konferenz beizutreten.`, 'OK', {duration: 3000});
      this.dialogRef.close();
  }

  public cancelCall() {
    this.dialogRef.close();
  }

}

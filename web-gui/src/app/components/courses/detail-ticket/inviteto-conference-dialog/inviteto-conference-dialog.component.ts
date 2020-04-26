import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UpdateCourseDialogComponent} from '../../detail-course/update-course-dialog/update-course-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {User} from '../../../../interfaces/HttpInterfaces';
import {ConferenceService} from '../../../../service/conference.service';
import {ClassroomService} from '../../../../service/classroom.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {serialize} from 'v8';
import {ObserversModule} from '@angular/cdk/observers';
import {Observable} from 'rxjs';
@Component({
  selector: 'app-inviteto-conference-dialog',
  templateUrl: './inviteto-conference-dialog.component.html',
  styleUrls: ['./inviteto-conference-dialog.component.scss']
})
export class InvitetoConferenceDialogComponent implements OnInit {
  invitee: User;
  form: FormGroup;
  conferenceSystemObs: Observable<String>;
  conferenceSystem: String;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<UpdateCourseDialogComponent>,
              private snackBar: MatSnackBar, private conferenceService: ConferenceService,
              private classroomService: ClassroomService, private _formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.invitee = this.data.user;
    this.conferenceSystemObs = this.conferenceService.getSelectedConferenceSystem();
    this.conferenceSystemObs.subscribe(n => {
      this.conferenceSystem = n;
    });
  }

  public startCall(invitee) {
    if (this.conferenceSystem == 'jitsi') {
      this.conferenceService.getSingleConferenceLink('jitsi').subscribe(m => {
        this.classroomService.inviteToConference(m, [invitee]);
        window.open(m, '_blank');
        this.snackBar.open(`${invitee.prename} ${invitee.surname} wurde eingeladen der Konferenz beizutreten.`, 'OK', {duration: 3000});
        this.dialogRef.close();
      });
    } else if (this.conferenceSystem == 'bigbluebutton') {
      this.conferenceService.getConferenceInvitationLinks('bigbluebutton').subscribe(m => {
        this.classroomService.inviteToConference(m.get('href'), [invitee]);
        window.open(m.get('mod_href'), '_blank');
        this.snackBar.open(`${invitee.prename} ${invitee.surname} wurde eingeladen der Konferenz beizutreten.`, 'OK', {duration: 3000});
        this.dialogRef.close();
      });
    }
  }
  public cancelCall() {
    this.dialogRef.close();
  }

}

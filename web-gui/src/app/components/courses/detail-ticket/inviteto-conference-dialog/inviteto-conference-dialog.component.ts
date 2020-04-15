import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UpdateCourseDialogComponent} from '../../detail-course/update-course-dialog/update-course-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {User} from '../../../../interfaces/HttpInterfaces';
import {ConferenceService} from '../../../../service/conference.service';
import {ClassroomService} from '../../../../service/classroom.service';

@Component({
  selector: 'app-inviteto-conference-dialog',
  templateUrl: './inviteto-conference-dialog.component.html',
  styleUrls: ['./inviteto-conference-dialog.component.scss']
})
export class InvitetoConferenceDialogComponent implements OnInit {
  invitee: User;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<UpdateCourseDialogComponent>,
              private snackBar: MatSnackBar, private conferenceService: ConferenceService,
              private classroomService: ClassroomService) {
  }

  ngOnInit(): void {
    this.invitee = this.data.user;
  }

  public startCall(invitee) {
    this.conferenceService.getSingleConferenceLink().subscribe(m => {
      this.classroomService.inviteToConference(m, [invitee]);
      // window.open(m, '_blank');
    });
  }

  public cancelCall() {
    this.dialogRef.close();
  }

}

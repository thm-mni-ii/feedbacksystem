import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormBuilder} from '@angular/forms';
import {ConferenceService} from '../../../../service/conference.service';
import {Observable} from 'rxjs';
import {ClassroomService} from '../../../../service/classroom.service';
/**
 * Dialog to create a new conference or update one
 */
@Component({
  selector: 'app-newconference-dialog',
  templateUrl: './newconference-dialog.component.html',
  styleUrls: ['./newconference-dialog.component.scss']
})
export class NewconferenceDialogComponent implements OnInit {
  conferenceURL = '';
  serviceid = 0;
  services = [ {'id': 0, 'name': 'bigbluebutton'}, {'id': 1, 'name': 'jitsi'}];
  constructor(public dialogRef: MatDialogRef<NewconferenceDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar,
              private _formBuilder: FormBuilder, public conferenceService: ConferenceService, public classroomService: ClassroomService) {
  }
  ngOnInit(): void {
  }

  cancelBtn() {
    this.dialogRef.close(0);
  }

  okBtn() {
    this.conferenceService.setSelectedConferenceSystem(this.services.find(service => service.id == this.serviceid).name);
    this.dialogRef.close(this.conferenceURL);
  }
}

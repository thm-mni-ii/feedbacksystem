import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormControl, FormGroup} from '@angular/forms';
import {DatabaseService} from '../../../../service/database.service';
import {Observable, Subscription} from 'rxjs';

import {
  ConferenceDetails,
} from '../../../../interfaces/HttpInterfaces';

/**
 * Dialog to create a new conference or update
 * one
 */
@Component({
  selector: 'app-newconference-dialog',
  templateUrl: './newconference-dialog.component.html',
  styleUrls: ['./newconference-dialog.component.scss']
})
export class NewconferenceDialogComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  conferenceForm = new FormGroup({
    conferenceCount: new FormControl('')
  });
  isUpdate: boolean;
  conferenceCount: number;

  //TODO:
  //Make conferences Observables
  conferences: ConferenceDetails[];

  constructor(public dialogRef: MatDialogRef<NewconferenceDialogComponent>, private db: DatabaseService,
              @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.conferences = this.db.getAllConferences(this.data.courseID)
    this.subs.add(this.conferenceForm.controls['conferenceCount'].valueChanges.subscribe(conferenceCount => {
      this.conferenceCount = conferenceCount;
    }));
    }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /**
   * Close dialog without updating
   * or creating conference
   */
  closeDialog() {
    this.dialogRef.close({success: false});
  }

  /**
   * Create a new conference
   * and close dialog
   */
  createConference() {
  //todo: umlaute
    if(this.conferenceForm.controls['conferenceCount'].value == 0) {
      this.snackBar.open('Bitte Anzahl der Konferenzraeume angeben:', 'OK', {duration: 3000});
    } else {
      this.db.addConferenceRooms(this.data.courseID,this.conferenceCount);
      this.conferences = this.db.getAllConferences(this.data.courseID)
    }
  }

  deleteConference(url){
    this.db.deleteConferenceRoom(this.data.courseID,url);
    this.conferences = this.db.getAllConferences(this.data.courseID);
  }
}

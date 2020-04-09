import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DatabaseService} from "../../../../service/database.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-incoming-call-dialog',
  templateUrl: './incoming-call-dialog.component.html',
  styleUrls: ['./incoming-call-dialog.component.css']
})
export class IncomingCallDialogComponent implements OnInit {

  teacherName: string;

  constructor(public dialogRef: MatDialogRef<IncomingCallDialogComponent>, private db: DatabaseService,
              @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.teacherName = this.data.teacherName;

    this.teacherName = "Simon Schniedenharn"
  }

  public acceptCall(){
    //todo: anruf annehmen
    this.dialogRef.close();
  }

  public declineCall(){
    //todo: anruf ablehnen;
    this.dialogRef.close();
  }
}

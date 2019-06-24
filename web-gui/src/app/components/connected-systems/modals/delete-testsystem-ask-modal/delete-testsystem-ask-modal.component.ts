import {Component, Inject, OnInit} from '@angular/core';
import {DatabaseService} from "../../../../service/database.service";
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from "@angular/material";

@Component({
  selector: 'app-delete-testsystem-ask-modal',
  templateUrl: './delete-testsystem-ask-modal.component.html',
  styleUrls: ['./delete-testsystem-ask-modal.component.scss']
})
export class DeleteTestsystemAskModalComponent implements OnInit {

  constructor(private db: DatabaseService, @Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<DeleteTestsystemAskModalComponent>) { }

  ngOnInit() {
  }

  close(success:boolean){
    this.dialogRef.close({success: success});
  }
}

import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {NewTaskInformation} from "../../../../interfaces/HttpInterfaces";

@Component({
  selector: 'app-answer-from-testsystem-dialog',
  templateUrl: './answer-from-testsystem-dialog.component.html',
  styleUrls: ['./answer-from-testsystem-dialog.component.scss']
})
export class AnswerFromTestsystemDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: NewTaskInformation, public dialogRef: MatDialogRef<AnswerFromTestsystemDialogComponent>) { }

  ngOnInit() {
  }

  testFileAccept(task: NewTaskInformation){
    let accept = true;
    task.testsystems.forEach(t => {
      accept = accept && t.test_file_accept
    })
    return accept
  }

  close(val){
    this.dialogRef.close({exit: val});
  }

}

import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Task} from "../../model/Task";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CourseService} from "../../service/course.service";
import {TaskService} from "../../service/task.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDatepickerInputEvent} from "@angular/material/datepicker";
import {CheckerConfig} from "../../model/CheckerConfig";
import {CheckerService} from "../../service/checker.service";

@Component({
  selector: 'app-new-checker-dialog',
  templateUrl: './new-checker-dialog.component.html',
  styleUrls: ['./new-checker-dialog.component.scss']
})
export class NewCheckerDialogComponent implements OnInit {

  checkerForm = new FormGroup({
    checkerType: new FormControl(''),
    ord: new FormControl(''),
  });

  mainFile: File;
  secondaryFile: File;
  isUpdate: boolean;
  courseId: number;
  taskId: number;
  checker: CheckerConfig = {
    checkerType: '',
    ord: 0,
  }

  constructor(public dialogRef: MatDialogRef<NewCheckerDialogComponent>,
              private checkerService: CheckerService,
              @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    if (this.data.checker) {
      this.isUpdate = true;
      this.checker = this.data.checker
      this.checkerForm.controls['checkerType'].setValue(this.checker.checkerType);
      this.checkerForm.controls['ord'].setValue(this.checker.ord);
    }
    this.courseId = this.data.courseId
    this.taskId = this.data.taskId
  }

  /**
   * Close dialog without updating
   * or creating task
   */
  closeDialog() {
    this.dialogRef.close({success: false});
  }

  /**
   * Create a new task
   * and close dialog
   */
  createChecker(value: any) {
    this.checker.checkerType = value.checkerType
    this.checker.ord = value.ord
    if (this.checker.checkerType && this.checker.ord && this.mainFile && (this.secondaryFile || this.checker.checkerType == 'bash')) {
      this.checkerService.createChecker(this.courseId, this.taskId, this.checker)
        .subscribe(checker => {
          this.checkerService.updateMainFile(this.courseId, this.taskId, checker.id, this.mainFile)
            .subscribe(ok => {}, error => console.error(error))
          this.checkerService.updateSecondaryFile(this.courseId, this.taskId, checker.id, this.secondaryFile)
            .subscribe(ok => {}, error => console.error(error))
        });
      this.dialogRef.close({success: true});
    } else {
      this.snackBar.open("Alle Felder müssen gefüllt werden.", "ok");
    }
  }

  updateMainFile(event) {
    this.mainFile = event['content'];

    // var reader = new FileReader();
    // reader.onload = function(event) {
    //   console.log('File content:', event.target.result);
    // };
    // this.mainFile = reader.readAsText(event['content']);
  }

  updateSecondaryFile(event) {
    this.secondaryFile = event['content'];
  }

  /**
   * Update given task
   * and close dialog
   */
  updateTask(value: any) {
    //Test 1
    // const toBase64 = file => new Promise((resolve, reject) => {
    //   const reader = new FileReader();
    //   reader.readAsText(file);
    //   reader.onload = () => resolve(reader.result);
    //   reader.onerror = error => reject(error);
    // });
    // Test 2
    // let fileReader = new FileReader();
    // fileReader.readAsText(this.mainFile)
    //
    // this.checker.checkerType = value.checkerType
    // this.checker.ord = value.ord

    if (this.checker.checkerType && this.checker.ord) {
      this.checkerService.updateChecker(this.courseId, this.taskId, this.checker.id, this.checker)
        .subscribe(async res => { // TODO: res is array of checker
          if(this.mainFile){
            // const temp = await toBase64(this.mainFile)
            // console.log(fileReader.result)
            this.checkerService.updateMainFile(this.courseId, this.taskId, this.checker.id, this.mainFile)
              .subscribe(ok => {}, error => console.error(error))
          }
          if (this.secondaryFile){
            this.checkerService.updateSecondaryFile(this.courseId, this.taskId, this.checker.id, this.secondaryFile)
              .subscribe(ok => {}, error => console.error(error))
          }
        });
      this.dialogRef.close({success: true});
    } else {
      this.snackBar.open("Alle Felder müssen gefüllt werden.", "ok");
    }
  }
}


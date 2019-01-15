import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup} from '@angular/forms';
import {DatabaseService} from '../../../../service/database.service';
import {Observable, Subscription} from 'rxjs';
import {Testsystem} from "../../../../interfaces/HttpInterfaces";

@Component({
  selector: 'app-newtask-dialog',
  templateUrl: './newtask-dialog.component.html',
  styleUrls: ['./newtask-dialog.component.scss']
})
export class NewtaskDialogComponent implements OnInit, OnDestroy {


  private subs = new Subscription();

  taskForm = new FormGroup({
    taskName: new FormControl(''),
    taskDescription: new FormControl('')
  });

  newTaskName: string;
  newTaskDescription: string;
  taskType: string;
  soutionFile: File;
  testTypes$: Observable<Testsystem[]>;


  constructor(public dialogRef: MatDialogRef<NewtaskDialogComponent>, private db: DatabaseService,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.testTypes$ = this.db.getTestsystemTypes();


    this.subs.add(this.taskForm.controls['taskName'].valueChanges.subscribe(name => {
      this.newTaskName = name;
    }));

    this.subs.add(this.taskForm.controls['taskDescription'].valueChanges.subscribe(description => {
      this.newTaskDescription = description;
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getFile(file: File) {
    this.soutionFile = file;
  }

  closeDialog() {
    this.dialogRef.close({success: false});
  }

  createTask() {
    this.db.createTask(this.data.courseID, this.newTaskName, this.newTaskDescription, this.soutionFile, this.taskType)
      .subscribe(success => this.dialogRef.close(success));
  }


}

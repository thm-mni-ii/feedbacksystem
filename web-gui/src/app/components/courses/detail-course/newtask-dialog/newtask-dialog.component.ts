import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup} from '@angular/forms';
import {DatabaseService} from '../../../../service/database.service';
import {Observable, Subscription} from 'rxjs';
import {Testsystem} from '../../../../interfaces/HttpInterfaces';

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
  isUpdate: boolean;


  constructor(public dialogRef: MatDialogRef<NewtaskDialogComponent>, private db: DatabaseService,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.testTypes$ = this.db.getTestsystemTypes();

    if (this.data.task) {
      this.isUpdate = true;
      this.taskForm.controls['taskName'].setValue(this.data.task.task_name);
      this.taskForm.controls['taskDescription'].setValue(this.data.task.task_description);
      this.taskType = this.data.task.testsystem_id;
    }


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

  /**
   * Load solution file for update
   * or creation
   * @param file The solution file
   */
  getFile(file: File) {
    this.soutionFile = file;
  }

  /**
   * Close dialog withoud updating
   * or creating task
   */
  closeDialog() {
    this.dialogRef.close({success: false});
  }

  /**
   * Create a new task
   */
  createTask() {
    this.db.createTask(this.data.courseID, this.newTaskName, this.newTaskDescription, this.soutionFile, this.taskType)
      .subscribe(success => this.dialogRef.close(success));
  }

  /**
   * Update given task
   */
  updateTask() {
    this.db.updateTask(this.data.task.task_id, this.newTaskName, this.newTaskDescription, this.soutionFile, this.taskType)
      .subscribe(success => this.dialogRef.close(success));
  }


}

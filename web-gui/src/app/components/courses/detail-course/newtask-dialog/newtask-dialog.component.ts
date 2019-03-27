import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {FormControl, FormGroup} from '@angular/forms';
import {DatabaseService} from '../../../../service/database.service';
import {Observable, Subscription} from 'rxjs';
import {Testsystem} from '../../../../interfaces/HttpInterfaces';

/**
 * Dialog to create a new task or update
 * one
 */
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
  soutionFiles: FileList;
  testTypes$: Observable<Testsystem[]>;
  isUpdate: boolean;
  deadline?: Date;


  constructor(public dialogRef: MatDialogRef<NewtaskDialogComponent>, private db: DatabaseService,
              @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.testTypes$ = this.db.getTestsystemTypes();

    if (this.data.task) {
      this.isUpdate = true;
      this.taskForm.controls['taskName'].setValue(this.data.task.task_name);
      this.taskForm.controls['taskDescription'].setValue(this.data.task.task_description);
      this.deadline = new Date(this.data.task.deadline);
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
   * Load solution file
   * @param file The solution file
   */
  getFiles(file: FileList) {
    this.soutionFiles = file;
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
  createTask() {
    if(typeof this.newTaskName == 'undefined'){
      this.snackBar.open('Bitte einen Namen für die neue Aufgabe angeben');
    } else if(typeof this.newTaskDescription == 'undefined'){
      this.snackBar.open('Bitte eine Beschreibung für die neue Aufgabe angeben');
    } else if(typeof this.taskType == 'undefined') {
      this.snackBar.open('Bitte ein Testsystem auswählen');
    } else if(typeof this.soutionFiles == 'undefined'){
      this.snackBar.open('Bitte Dateien auswählen');
    } else if(typeof this.deadline == 'undefined') {
        this.snackBar.open('Bitte eine Deadline festlegen')
    } else {
      this.db.createTask(this.data.courseID, this.newTaskName,
        this.newTaskDescription, this.soutionFiles, this.taskType, this.deadline)
        .subscribe(success => this.dialogRef.close(success));
    }
  }

  /**
   * Update given task
   * and close dialog
   */
  updateTask() {
    this.db.updateTask(this.data.task.task_id, this.newTaskName,
      this.newTaskDescription, this.soutionFiles, this.taskType, this.deadline)
      .subscribe(success => this.dialogRef.close(success));
  }


}

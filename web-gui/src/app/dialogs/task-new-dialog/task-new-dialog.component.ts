import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDatepickerInputEvent} from "@angular/material/datepicker";
import {Subscription} from 'rxjs';
import { Task } from 'src/app/model/Task';
import {CourseService} from "../../service/course.service";
import {TaskService} from "../../service/task.service";

/**
 * Dialog to create or update a task
 */
@Component({
  selector: 'app-task-new-dialog',
  templateUrl: './task-new-dialog.component.html',
  styleUrls: ['./task-new-dialog.component.scss']
})
export class TaskNewDialogComponent implements OnInit, OnDestroy {
  private subs = new Subscription();

  taskForm = new FormGroup({
    taskName: new FormControl('',[Validators.required]),
    taskDescription: new FormControl(''),
    deadline: new FormControl(new Date()),
    mediaType: new FormControl(''),
  });
  isUpdate: boolean;
  courseID: number;
  task: Task = new class implements Task {
    deadline: number = Date.now();
    description: string;
    mediaType: string;
    name: string;
  }

  constructor(public dialogRef: MatDialogRef<TaskNewDialogComponent>,
              private courseService: CourseService, private taskService: TaskService,
              @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar) {
  }

  ngOnInit() {

    if (this.data.task) {
      this.isUpdate = true;
      this.task = this.data.task
      this.taskForm.controls['taskName'].setValue(this.data.task.name);
      this.taskForm.controls['taskDescription'].setValue(this.data.task.description);
      this.taskForm.controls['mediaType'].setValue(this.data.task.mediaType);
    } else if (this.data.courseDetail) {
        this.courseID = this.data.courseDetail.id
    } else {
      // ERROR
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /**
   * Close dialog without updating
   * or creating task
   */
  closeDialog() {
    this.dialogRef.close({success: false});
  }

  checkDate():boolean{
    if(this.task.deadline<=Date.now()) return false
    else return true
  }

  getValues(){
    this.task.name = this.taskForm.get('taskName').value;
    this.task.description = this.taskForm.get('taskDescription').value;
    this.task.mediaType = this.taskForm.get('mediaType').value;
  }
  /**
   * Create a new task
   * and close dialog
   */
  createTask(value: any) {
    this.getValues()
    if(this.checkDate() && this.task.name) {
      this.snackBar.open("Neuer Task erstellt.", "ok");
      this.taskService.createTask(this.courseID, this.task).subscribe(
        res => {
          this.dialogRef.close({success: res});
        });
    }
    else{
      this.snackBar.open("Das Datum sollte in der Zukunft liegen.", "ok");
    }
  }

  /**
   * Update given task
   * and close dialog
   */
  updateTask(value: any) {
    this.getValues()
    if(this.checkDate() && this.task.name) {
      this.snackBar.open("Task bearbeitet.", "ok");
      this.taskService.updateTask(this.courseID, this.task.id, this.task).subscribe(
        res => {
          this.dialogRef.close({success: res});
        });
    }
    else{
      this.snackBar.open("Das Datum sollte in der Zukunft liegen.", "ok");
    }
  }

  addDate(event: MatDatepickerInputEvent<Date>) {
    this.task.deadline = event.value.valueOf()
  }
}

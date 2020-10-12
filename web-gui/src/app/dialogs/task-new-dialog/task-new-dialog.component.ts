import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDatepickerInputEvent} from "@angular/material/datepicker";
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
export class TaskNewDialogComponent implements OnInit {
  taskForm = new FormGroup({
    name: new FormControl('',[Validators.required]),
    description: new FormControl(''),
    deadline: new FormControl(new Date()),
    mediaType: new FormControl(''),
  });

  isUpdate: boolean;
  coursenumber: number;
  task: Task = {
    deadline: Date.now(),
    description: '',
    mediaType: '',
    name: ''
  }

  constructor(public dialogRef: MatDialogRef<TaskNewDialogComponent>,
              private courseService: CourseService, private taskService: TaskService,
              @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    if (this.data.task) {
      this.isUpdate = true;
      this.task = this.data.task
      this.taskForm.controls['name'].setValue(this.task.name);
      this.taskForm.controls['description'].setValue(this.task.description);
      this.taskForm.controls['mediaType'].setValue(this.task.mediaType);
    }
    this.coursenumber = this.data.courseId
  }

  /**
   * Close dialog without updating
   * or creating task
   */
  closeDialog() {
    this.dialogRef.close({success: false});
  }

  getValues(){
    this.task.name = this.taskForm.get('name').value;
    this.task.description = this.taskForm.get('description').value;
    this.task.mediaType = this.taskForm.get('mediaType').value;
  }
  /**
   * Create a new task
   * and close dialog
   */
  createTask(value: any) {
    this.getValues()
    if (this.task.name) {
      this.taskService.createTask(this.coursenumber, this.task).subscribe(task => {
        this.dialogRef.close({success: true, task: task});
      });
    } else {
      this.snackBar.open("Bitte ein valides Datum wählen.", "ok");
    }
  }

  /**
   * Update given task
   * and close dialog
   */
  updateTask(value: any) {
    this.getValues()
    if (this.task.name) {
      this.snackBar.open("Task bearbeitet.", "ok");
      this.taskService.updateTask(this.coursenumber, this.task.id, this.task).subscribe(task => {
          this.dialogRef.close({success: true, task: task});
        });
    } else {
      this.snackBar.open("Das Datum sollte in der Zukunft liegen.", "ok");
    }
  }

  addDate(event: MatDatepickerInputEvent<Date>) {
    this.task.deadline = event.value.valueOf()
  }
}

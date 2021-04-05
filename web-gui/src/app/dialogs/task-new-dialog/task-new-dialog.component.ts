import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import { Task } from 'src/app/model/Task';
import {CourseService} from '../../service/course.service';
import {TaskService} from '../../service/task.service';
import {SpreadsheetDialogComponent} from '../spreadsheet-dialog/spreadsheet-dialog.component';

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
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    deadline: new FormControl(new Date()),
    mediaType: new FormControl(''),
    exelFile: new FormControl(''),
    userID: new FormControl(''),
    input: new FormControl(''),
    result: new FormControl(''),
  });

  isUpdate: boolean;
  courseId: number;
  task: Task = {
    deadline: new Date().toISOString(),
    description: '',
    mediaType: '',
    name: ''
  };

  spreadsheet: File = null;

  constructor(public dialogRef: MatDialogRef<TaskNewDialogComponent>,
              private courseService: CourseService, private taskService: TaskService,
              @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    if (this.data.task) {
      this.isUpdate = true;
      this.task = this.data.task;
      this.taskForm.controls['name'].setValue(this.task.name);
      this.taskForm.controls['description'].setValue(this.task.description);
      this.taskForm.controls['mediaType'].setValue(this.task.mediaType);
      this.taskForm.controls['deadline'].setValue(new Date(this.task.deadline));
    }
    this.courseId = this.data.courseId;
  }

  /**
   * Close dialog without updating
   * or creating task
   */
  closeDialog() {
    this.dialogRef.close({success: false});
  }

  getValues() {
    this.task.name = this.taskForm.get('name').value;
    this.task.description = this.taskForm.get('description').value;
    this.task.mediaType = this.taskForm.get('mediaType').value;
  }
  /**
   * Create a new task
   * and close dialog
   */
  createTask(value: any) {
    this.getValues();
    if (this.task.name) {
      this.taskService.createTask(this.courseId, this.task).subscribe(task => {
          this.dialogRef.close({success: true, task: task});
      });
    } else {
      this.snackBar.open('Bitte ein valides Datum wählen.', 'ok');
    }
  }

  /**
   * Update given task
   * and close dialog
   */
  updateTask(value: any) {
    this.getValues();
    if (this.task.name) {
      this.snackBar.open('Task bearbeitet.', 'ok');
      this.taskService.updateTask(this.courseId, this.task.id, this.task).subscribe(task => {
          this.dialogRef.close({success: true, task: task});
        });
    } else {
      this.snackBar.open('Das Datum sollte in der Zukunft liegen.', 'ok');
    }
  }

  addDate(event: MatDatepickerInputEvent<Date>) {
    this.task.deadline = event.value.toISOString();
  }

  uploadExel(event: Event) {
    const file = (event.currentTarget as any).files[0];
    this.spreadsheet = file;
    this.taskForm.patchValue({exelFile: file.name});
  }

  getFromSpreadsheet(field: string) {
    if (this.spreadsheet === null) {
      return;
    }
    this.dialog.open(SpreadsheetDialogComponent,  {
      height: 'auto',
      width: '50%',
      data: {
        spreadsheet: this.spreadsheet,
      }
    }).afterClosed().subscribe((fields) => {
      if (fields === null) {
        return;
      }
      const values = {};
      values[field] = fields.join(':');
      this.taskForm.patchValue(values);
    });
  }
}

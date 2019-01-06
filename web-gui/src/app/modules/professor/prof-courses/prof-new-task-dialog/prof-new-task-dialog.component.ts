import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

/**
 * Dialog component for updating and creating task
 */
@Component({
  selector: 'app-prof-new-task-dialog',
  templateUrl: './prof-new-task-dialog.component.html',
  styleUrls: ['./prof-new-task-dialog.component.scss']
})
export class ProfNewTaskDialogComponent implements OnInit {

  constructor(private matDialogRef: MatDialogRef<ProfNewTaskDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: NewTask) {
  }


  taskName: string;
  taskDescription: string;
  taskType: string;
  taskSolutionFile: File;

  ngOnInit() {
    if (this.data) {
      this.taskName = this.data.name;
      this.taskDescription = this.data.description;
    }
  }

  /**
   * Close dialog without doing anything
   */
  onNoClick() {
    this.matDialogRef.close();
  }

  /**
   * Send back a new Task to parent component
   */
  onYesClick() {
    let result: NewTask = {
      name: this.taskName,
      description: this.taskDescription,
      type: this.taskType,
      solutionFile: this.taskSolutionFile
    };
    this.matDialogRef.close(result);
  }

  /**
   * Get file from Dialog
   * @param event Event to get file from dialog
   */
  getFile(event) {
    this.taskSolutionFile = event.target.files[0];
  }

}

/**
 * Interface when new Task is created
 * or updated
 */
export interface NewTask {
  name: string;
  description: string;
  type: string;
  solutionFile: File;
}

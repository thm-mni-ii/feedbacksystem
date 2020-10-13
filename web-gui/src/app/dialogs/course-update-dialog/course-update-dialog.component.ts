import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Observable} from 'rxjs';
import {DatabaseService} from '../../service/database.service';
import {DetailedCourseInformation, Testsystem} from '../../model/HttpInterfaces';
import {Course} from "../../model/Course";
import {CourseService} from "../../service/course.service";
import {TitlebarService} from "../../service/titlebar.service";
import {Router} from "@angular/router";


/**
 * Updates course information in dialog
 */
@Component({
  selector: 'app-course-update-dialog',
  templateUrl: './course-update-dialog.component.html',
  styleUrls: ['./course-update-dialog.component.scss']
})
export class CourseUpdateDialogComponent implements OnInit {
  name = new FormControl('', [Validators.required]);
  description = new FormControl('');
  isVisible = true

  isUpdateDialog: boolean = false;

  constructor(private courseService: CourseService,
              private snackBar: MatSnackBar,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<CourseUpdateDialogComponent>) {
  }

  ngOnInit() {
    this.isUpdateDialog = this.data.isUpdateDialog
    if (this.isUpdateDialog) {
      const course: Course = this.data.course
      this.name.setValue(course.name)
      this.description.setValue(course.description)
      this.isVisible = course.visible
    }
  }

  /**
   * Get data from form groups and create new course
   */
  saveCourse() {
    if (!this.isInputValid) {
      return;
    }

    const course: Course = {
      name: this.name.value,
      description: this.description.value,
      visible: this.isVisible
    }

    if (this.isUpdateDialog) {
      this.courseService
        .updateCourse(this.data.course.id, course)
        .subscribe(ok => this.dialogRef.close({success: true}), error => console.error(error))
    } else {
      this.courseService
        .createCourse(course)
        .subscribe(course => {
          this.dialogRef.close({success: true, course: course})
        }, error => {
          console.error(error)
          this.snackBar.open("Es ist ein fehler beim erstellen des Kurses aufgetreten", null, {duration: 3000});
        })
    }
  }

  isInputValid(): boolean {
    return this.name.valid && this.description.valid;
  }

  /**
   * Close dialog without update
   */
  closeDialog() {
    this.dialogRef.close({success: false});
  }
}

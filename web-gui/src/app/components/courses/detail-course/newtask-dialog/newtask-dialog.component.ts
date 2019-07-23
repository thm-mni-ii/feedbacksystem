import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar, MatSlideToggle} from '@angular/material';
import {FormControl, FormGroup} from '@angular/forms';
import {DatabaseService} from '../../../../service/database.service';
import {Observable, Subscription} from 'rxjs';
import {DetailedCourseInformation, Testsystem, TestsystemTestfile} from '../../../../interfaces/HttpInterfaces';


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
  testFilesSubmissionList = {};
  testTypes: Testsystem[];
  isUpdate: boolean;
  deadline?: Date;
  testSystemFiles: TestsystemTestfile[];
  load_external_description: boolean = false;


  constructor(public dialogRef: MatDialogRef<NewtaskDialogComponent>, private db: DatabaseService,
              @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.loadAndPreselectTestsystemTypes()

    if (this.data.task) {
      this.isUpdate = true;
      this.taskForm.controls['taskName'].setValue(this.data.task.task_name);
      this.taskForm.controls['taskDescription'].setValue(this.data.task.task_description);
      this.deadline = new Date(this.data.task.deadline);
      this.taskType = this.data.task.testsystem_id;
      this.newTaskDescription = this.data.task.task_description
      this.load_external_description = this.data.task.load_external_description
    }


    this.subs.add(this.taskForm.controls['taskName'].valueChanges.subscribe(name => {
      this.newTaskName = name;
    }));

    this.subs.add(this.taskForm.controls['taskDescription'].valueChanges.subscribe(description => {
      this.newTaskDescription = description;
    }));

    if(this.isUpdate) {
      this.loadFileUploadFields(this.taskType)
    }

  }

  loadAndPreselectTestsystemTypes() {
    this.db.getTestsystemTypes().subscribe(data => {
      this.testTypes = data
      if(this.data.courseID) {
        this.db.getCourseDetail(this.data.courseID).subscribe((value: DetailedCourseInformation) => {
          this.taskType = value.standard_task_typ
          this.loadFileUploadFields(this.taskType)
        })
      }
    })
  }

  loadFileUploadFields(taskTypeValue){
    this.db.getTestsystemDetails(taskTypeValue)
      .then((testsystem: Testsystem) => {
        this.testSystemFiles = testsystem.testfiles
      })
      .catch((e) => {
        this.snackBar.open("Leider konnten keine Testdateien zu dem ausgewählten Testsystem geladen werden", 'OK', {duration: 3000});
      })
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /**
   * Load solution file
   * @param file The solution file
   */
  addFilesToList(file: FileList, filename: string) {
    this.testFilesSubmissionList[filename] = file
    this.soutionFiles = file;
  }

  removeFilesFromList(filename: string){
    delete this.testFilesSubmissionList[filename]
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
      this.snackBar.open('Bitte einen Namen für die neue Aufgabe angeben', 'OK', {duration: 3000});
    }

    else if(typeof this.newTaskDescription == 'undefined'){
      this.snackBar.open('Bitte eine Beschreibung für die neue Aufgabe angeben', 'OK', {duration: 3000});
    }

    else if(typeof this.taskType == 'undefined') {
      this.snackBar.open('Bitte ein Testsystem auswählen', 'OK', {duration: 3000});
    }

    else if(typeof this.deadline == 'undefined') {
        this.snackBar.open('Bitte eine Deadline festlegen', 'OK', {duration: 3000});
    }

    else {
      if(!this.checkAllNeededFilesAreSet()){
        this.snackBar.open('Bitte alle erforderlichen Dateien angeben: ' + this.testSystemFiles.filter(v => v.required).map(v => v.filename).join(', '), 'OK', {duration: 3000});
      } else {
        this.db.createTask(this.data.courseID, this.newTaskName,
          this.newTaskDescription, this.testFilesSubmissionList, this.taskType, this.deadline, this.load_external_description)
          .subscribe(success => this.dialogRef.close(success));
      }
    }
  }


  private checkAllNeededFilesAreSet(): boolean{
    // Check if all required files are set
    let allNeededFilesSet = true;
    this.testSystemFiles.forEach(testfile => {
      if(testfile.required) {
        allNeededFilesSet = allNeededFilesSet && (testfile.filename in this.testFilesSubmissionList)
      }
    })
    return allNeededFilesSet
  }

  /**
   * Update given task
   * and close dialog
   */
  updateTask() {
      let formatedDeadline = this.deadline.toLocaleDateString() + " " + this.deadline.toLocaleTimeString()
    this.db.updateTask(this.data.task.task_id, this.newTaskName,
      this.newTaskDescription, this.testFilesSubmissionList, this.taskType, this.deadline, this.load_external_description)
        .subscribe(success => this.dialogRef.close(success));
  }


}

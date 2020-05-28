import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormControl, FormGroup} from '@angular/forms';
import {DatabaseService} from '../../../../service/database.service';
import {Subscription} from 'rxjs';
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
  deadline: FormControl = new FormControl(new Date());
  testSystemFiles: TestsystemTestfile[][];
  testsystemList: string[];
  load_external_description = false;


  constructor(public dialogRef: MatDialogRef<NewtaskDialogComponent>, private db: DatabaseService,
              @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.loadAndPreselectTestsystemTypes();
    this.testSystemFiles = [];
    this.testsystemList = [];

    if (this.data.task) {
      this.isUpdate = true;
      this.taskForm.controls['taskName'].setValue(this.data.task.task_name);
      this.taskForm.controls['taskDescription'].setValue(this.data.task.task_description);
      this.deadline.setValue(new Date(this.data.task.deadline));
      this.taskType = this.data.task.testsystem_id;
      this.newTaskDescription = this.data.task.task_description;
      this.load_external_description = this.data.task.load_external_description;

      this.testsystemList = this.data.task.testsystems.map(system => {
        return system.testsystem_id;
      });
      this.loadFileUploadFields(null, null);
    } else if (this.data.courseID) {
        this.db.getCourseDetail(this.data.courseID).subscribe((value: DetailedCourseInformation) => {
          this.testsystemList.push(value.standard_task_typ);
          this.loadFileUploadFields(null, null);
        });
    } else {
      // ERROR
    }


    this.subs.add(this.taskForm.controls['taskName'].valueChanges.subscribe(name => {
      this.newTaskName = name;
    }));

    this.subs.add(this.taskForm.controls['taskDescription'].valueChanges.subscribe(description => {
      this.newTaskDescription = description;
    }));

  }

  loadAndPreselectTestsystemTypes() {
    this.db.getTestsystemTypes().subscribe(data => {
      this.testTypes = data;
    });
  }

  public deleteTestsystem(pos: number) {
    this.testsystemList.splice(pos, 1);
  }
  public addTestsystem() {
    this.testsystemList.push('');
    this.testSystemFiles.push([]);
  }
  /** very tricky hack to avoid strange behaviour in multiple mat-selects*/
  trackByItems(index: number, item: any): number { return index; }

  loadFileUploadFields($event, pos: number) {
    if (pos != null) {
      this.db.getTestsystemDetails($event.value)
        .then((testsystem: Testsystem) => {
          this.testSystemFiles[pos] = testsystem.testfiles;
        })
        .catch((e) => {
          this.snackBar.open('Leider konnten keine Testdateien zu dem ausgewählten Testsystem geladen werden', 'OK', {duration: 3000});
        });
    } else {
      this.testSystemFiles = [];
      this.testsystemList.forEach((testsystemItem, index) => {
        this.db.getTestsystemDetails(testsystemItem)
          .then((testsystem: Testsystem) => {
            this.testSystemFiles[index] = testsystem.testfiles;
          })
          .catch((e) => {
            this.snackBar.open('Leider konnten keine Testdateien zu dem ausgewählten Testsystem geladen werden', 'OK', {duration: 3000});
          });
      });
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /**
   * Load solution file
   * @param file The solution file
   */
  addFilesToList(file: FileList, filename: string, pos: number) {
    if (typeof this.testFilesSubmissionList[pos] == 'undefined') {
      this.testFilesSubmissionList[pos] = {};
    }

    this.testFilesSubmissionList[pos][filename] = file;
    this.soutionFiles = file;
  }

  removeFilesFromList(filename: string, pos: number) {
    delete this.testFilesSubmissionList[pos][filename];
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
    if (typeof this.newTaskName == 'undefined') {
      this.snackBar.open('Bitte einen Namen für die neue Aufgabe angeben', 'OK', {duration: 3000});
    } else if (typeof this.newTaskDescription == 'undefined') {
      this.snackBar.open('Bitte eine Beschreibung für die neue Aufgabe angeben', 'OK', {duration: 3000});
    } else if (this.testsystemList.length == 0) {
      this.snackBar.open('Bitte ein Testsystem auswählen', 'OK', {duration: 3000});
    } else if (typeof this.deadline == 'undefined') {
        this.snackBar.open('Bitte eine Deadline festlegen', 'OK', {duration: 3000});
    } else {
      if (!this.checkAllNeededFilesAreSet()) {
        let noticeMsg = '';
        let num = 0;
        this.testSystemFiles.forEach(system => {
          num++;
          noticeMsg += `Testsystem ${num}: ${system.filter(v => v.required).map(v => v.filename).join(', ')}. `;
        });

        this.snackBar.open('Bitte alle erforderlichen Dateien angeben: ' + noticeMsg, 'OK', {duration: 3000});
      } else {
        const formatedDeadline = new Date(this.deadline.value)
        this.db.createTask(this.data.courseID, this.newTaskName,
          this.newTaskDescription, this.testFilesSubmissionList, this.testsystemList, formatedDeadline, this.load_external_description)
          .subscribe(success => this.dialogRef.close(success));
      }
    }
  }

  private checkAllNeededFilesAreSet(): boolean {
    // Check if all required files are set
    let allNeededFilesSet = true;
    this.testSystemFiles.forEach((testsystem, index) => {
      testsystem.forEach(testfile => {
      if (testfile.required) {
        if (typeof this.testFilesSubmissionList[index] == 'undefined') {
          allNeededFilesSet = false;
        } else {
          allNeededFilesSet = allNeededFilesSet && (testfile.filename in this.testFilesSubmissionList[index]);
        }

      }
    }); });
    return allNeededFilesSet;
  }

  /**
   * Update given task
   * and close dialog
   */
  updateTask() {
    const formatedDeadline = new Date(this.deadline.value)
    this.db.updateTask(this.data.task.task_id, this.newTaskName,
      this.newTaskDescription, this.testFilesSubmissionList, this.taskType, formatedDeadline, this.load_external_description)
      .subscribe(success => this.dialogRef.close(success));
  }
}

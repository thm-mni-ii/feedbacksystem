import {Component, OnDestroy, OnInit} from '@angular/core';
import {CourseTableItem} from "../../student/student-list/course-table/course-table-datasource";
import {CourseDetail, DatabaseService, ReturnMessage} from "../../../service/database.service";
import {MatDialog, MatSnackBar} from "@angular/material";
import {NewTask, ProfNewTaskDialogComponent} from "./prof-new-task-dialog/prof-new-task-dialog.component";

/**
 * Component that shows all courses the
 * lecturer has
 */
@Component({
  selector: 'app-prof-courses',
  templateUrl: './prof-courses.component.html',
  styleUrls: ['./prof-courses.component.scss']
})
export class ProfCoursesComponent implements OnInit, OnDestroy {

  courses: CourseTableItem[];
  courseName: string;
  courseDescription: string;
  courseStandardTaskType: string;
  courseSemester: string;
  courseModuleID: string;
  courseIsPublic: boolean;

  // Tasks
  coursedetail: CourseDetail;


  constructor(private db: DatabaseService, private snackbar: MatSnackBar, private matDialog: MatDialog) {
  }

  // Get newest course data from server
  private updateCourseData() {
    this.db.getCourses().subscribe(courses => {
      this.courses = courses;
    });
  }


  ngOnInit() {
    this.updateCourseData();
  }

  ngOnDestroy(): void {
  }

  /**
   * Lecturer updates a existing course
   * @param id The id of course to update
   */
  updateCourse(id: number) {
    this.db.updateCourse(id, this.courseName, this.courseDescription, this.courseStandardTaskType, this.courseSemester,
      this.courseModuleID, this.courseIsPublic)
      .subscribe(result => {
        if (result.success) {
          this.snackbar.open("Update erfolgreich", null, {duration: 2000});
          this.updateCourseData();
        } else {
          this.snackbar.open("Fehler bei Kurs update", "OK", {duration: 3000});
        }
      });
  }


  /**
   * Lecturer opens dialog for new Task
   * @param idCourse The id of course where task will be added
   */
  newTask(idCourse: number) {
    const dialogRef = this.matDialog.open(ProfNewTaskDialogComponent, {height: '400px', width: '600px'});

    dialogRef.afterClosed().subscribe((taskResult: NewTask) => {
      this.db.createTask(idCourse, taskResult.name, taskResult.description, taskResult.solutionFile, taskResult.type);
      this.updateCourseData();
    });
  }

  /**
   * Lecturer updates an existing Task.
   * Default values get send to dialog and changed there.
   * After change data will be send back and updated from here
   * @param id The unique id of task which will be updated
   * @param taskName Name which will be send to dialog for update
   * @param taskDescription Description which will be send to dialog for update
   */
  updateTask(id: number, taskName: string, taskDescription: string) {
    const dialogRef = this.matDialog.open(ProfNewTaskDialogComponent, {
      height: '400px',
      width: '600px',
      data: {name: taskName, description: taskDescription}
    });

    dialogRef.afterClosed().subscribe((taskResult: NewTask) => {
      this.db.updateTask(id, taskResult.name, taskResult.description, taskResult.solutionFile, taskResult.type);
      this.updateCourseData();
    });

  }

  /**
   * Lecturer deletes an existing task
   * @param idTask The unique task id
   * @param taskName Name to display after deletion
   */
  deleteTask(idTask: number, taskName: string) {
    this.db.deleteTask(idTask).subscribe((value: ReturnMessage) => {
      if (value.success) {
        this.snackbar.open("Aufgabe " + taskName + " gelöscht", "OK", {duration: 3000});
        this.updateCourseData()
      } else {
        this.snackbar.open("Fehler beim Löschen von Aufgabe " + taskName, "OK", {duration: 3000});
      }
    });
  }

  /**
   * After opening an expansion panel
   * the id of course will be used to load all
   * task of this course.
   * @param id The id of the course from which all task
   * will be loaded
   */
  getCourseID(id: number) {
    this.db.getCourseDetail(id).subscribe(courseDetail => {
      this.coursedetail = courseDetail;
    })
  }


}

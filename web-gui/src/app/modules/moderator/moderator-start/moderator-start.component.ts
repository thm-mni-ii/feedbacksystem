import {Component, OnDestroy, OnInit} from '@angular/core';
import {DatabaseService} from "../../../service/database.service";
import {CourseTableItem} from "../../student/student-list/course-table/course-table-datasource";
import {Subscription} from "rxjs";
import {AuthService} from "../../../service/auth.service";
import {MatSnackBar} from "@angular/material";


/**
 * Moderator manages Courses and gives them Lecturers.
 */
@Component({
  selector: 'app-moderator-start',
  templateUrl: './moderator-start.component.html',
  styleUrls: ['./moderator-start.component.scss']
})
export class ModeratorStartComponent implements OnInit, OnDestroy {

  constructor(private db: DatabaseService, private auth: AuthService, private snackBar: MatSnackBar) {
  }

  private allCoursesSub: Subscription;
  allCourses: CourseTableItem[];

  // New course
  courseName: string;
  courseDescription: string;
  courseStandardTaskType: string;
  courseSemester: string;
  courseID: string;
  isPublic: boolean;

  // Select Docent
  docentUsername: string;


  ngOnInit() {
    this.courseName = '';
    this.courseDescription = '';
    this.allCoursesSub = this.db.getAllCourses().subscribe(courses => {
      this.allCourses = courses;
    });
  }


  ngOnDestroy(): void {
    this.allCoursesSub.unsubscribe();
  }

  createNewCourse() {
    this.db.createCourse(this.courseName, this.courseDescription,
      this.courseStandardTaskType, this.courseSemester, this.courseID, this.isPublic).subscribe(res => {
        console.log(JSON.stringify(res));
      },
      err => {
        console.log(err)
      },
      () => {
        this.db.getAllCourses().subscribe(courses => {
          this.allCourses = courses;
        });
      });
  }


  selectDocent(courseID: number, courseName: string) {
    this.db.adminGrantDocentRights(courseID, this.docentUsername).subscribe(msg => {
        if (msg.success) {
          this.snackBar.open(this.docentUsername + " ist jetzt Docent für Kurs " + courseName, "OK", {duration: 3000});
        } else {
          this.snackBar.open(this.docentUsername + " Fehler", "OK", {duration: 3000});
        }
      }
    );

  }

  logout() {
    this.auth.logout();
  }


}

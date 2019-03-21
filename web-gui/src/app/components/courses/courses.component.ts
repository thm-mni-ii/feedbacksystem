import {Component, OnInit} from '@angular/core';
import {TitlebarService} from '../../service/titlebar.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {DatabaseService} from '../../service/database.service';
import {GeneralCourseInformation, Succeeded} from '../../interfaces/HttpInterfaces';
import {MatDialog, MatSnackBar} from "@angular/material";
import {DeleteCourseModalComponent} from "./modals/delete-course-modal/delete-course-modal.component";
import {delay, flatMap, retryWhen, take} from 'rxjs/operators';

/**
 * Show all courses user subscribed
 */
@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {

  constructor(private dialog: MatDialog, private titlebar: TitlebarService, private db: DatabaseService, private router: Router, private snackbar: MatSnackBar) {
  }

  userCourses$: Observable<GeneralCourseInformation[]>;

  ngOnInit() {
    this.titlebar.emitTitle('Meine Kurse');
    this.userCourses$ = this.db.getSubscribedCourses();

  }

  /**
   * Show course in detail
   * @param courseID The course to see in detail
   */
  goToCourse(courseID: number) {
    this.router.navigate(['courses', courseID]);
  }

  /**
   * Deletes a course by its ID, simply sends a REST request, if user not permitted, nothing happends
   * @param courseID The course id which should be deleted
   */
  deleteCourse(courseName: string, courseID: number) {
    this.dialog.open(DeleteCourseModalComponent, {
      data: {coursename: courseName, courseID: courseID}
    }).afterClosed().pipe(
      flatMap(value => {
        console.log(value);
        if (value.exit) {
          return this.db.deleteCourse(courseID)
        }
      })
    )
    .toPromise()
      .then( (value: Succeeded) => {
        if(value.success){
          this.snackbar.open('Kurs mit der ID ' + courseID + ' wurde gelöscht', 'OK', {duration: 5000});
        } else {
          this.snackbar.open('Leider konnte der Kurs ' + courseID + ' nicht gelöscht werden. Dieser Kurs scheint nicht zu existieren.', 'OK', {duration: 5000});
        }
      })
      .catch(() => {
        this.snackbar.open('Leider konnte der Kurs ' + courseID + ' nicht gelöscht werden. Wahrscheinlich hast du keine Berechtigung', 'OK', {duration: 5000});
      })
      .then(() => {
        this.userCourses$ = this.db.getSubscribedCourses();
      })
  }
}

import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {flatMap} from 'rxjs/operators';
import {TitlebarService} from '../../service/titlebar.service';
import {DatabaseService} from '../../service/database.service';
import {GeneralCourseInformation, Succeeded} from '../../model/HttpInterfaces';
import {DeleteCourseModalComponent} from '../../components/courses/modals/delete-course-modal/delete-course-modal.component';

/**
 * Show all courses user subscribed
 */
@Component({
  selector: 'app-my-courses',
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.scss']
})
export class MyCoursesComponent implements OnInit {
  userCourses$: Observable<GeneralCourseInformation[]>;

  constructor(private dialog: MatDialog, private titlebar: TitlebarService, private db: DatabaseService,
              private router: Router, private snackbar: MatSnackBar) {
  }

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
}

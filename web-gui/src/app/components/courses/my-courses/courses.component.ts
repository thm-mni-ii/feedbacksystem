import {Component, OnInit} from '@angular/core';
import {TitlebarService} from '../../../service/titlebar.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {DatabaseService} from '../../../service/database.service';
import {GeneralCourseInformation, Succeeded} from '../../../interfaces/HttpInterfaces';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DeleteCourseModalComponent} from '../modals/delete-course-modal/delete-course-modal.component';
import {flatMap} from 'rxjs/operators';

/**
 * Show all courses user subscribed
 */
@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
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

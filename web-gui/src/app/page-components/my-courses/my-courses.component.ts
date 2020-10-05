import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Observable} from 'rxjs';
import {TitlebarService} from '../../service/titlebar.service';
import {DatabaseService} from '../../service/database.service';
import {UserService} from "../../service/user.service";
import {CourseService} from "../../service/course.service";
import {Course} from "../../model/Course";

/**
 * Show all registered courses
 */
@Component({
  selector: 'app-my-courses',
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.scss']
})
export class MyCoursesComponent implements OnInit {
  registeredCourses$: Observable<Course[]>;

  constructor(private dialog: MatDialog, private titlebar: TitlebarService, private db: DatabaseService,
              private snackbar: MatSnackBar, private userService: UserService,
              private courseService: CourseService,) {
  }

  ngOnInit() {
    this.titlebar.emitTitle('Meine Kurse');
    this.registeredCourses$ = this.courseService.getRegisteredCourses(5); // TODO: ID from cookie
  }
}

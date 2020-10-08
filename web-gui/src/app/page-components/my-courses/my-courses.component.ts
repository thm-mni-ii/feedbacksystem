import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Observable, of} from 'rxjs';
import {TitlebarService} from '../../service/titlebar.service';
import {DatabaseService} from '../../service/database.service';
import {UserService} from "../../service/user.service";
import {CourseService} from "../../service/course.service";
import {Course} from "../../model/Course";
import {AuthService} from "../../service/auth.service";
import {flatMap, startWith} from "rxjs/operators";
import {FormControl} from "@angular/forms";

/**
 * Show all registered courses
 */
@Component({
  selector: 'app-my-courses',
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.scss']
})
export class MyCoursesComponent implements OnInit {

  constructor(private titlebar: TitlebarService,
              private courseService: CourseService,
              private authService: AuthService) {
  }

  courses: Observable<Course[]> = of();
  filteredCourses: Observable<Course[]> = of();
  control: FormControl = new FormControl();

  ngOnInit() {
    this.titlebar.emitTitle('Meine Kurse');
    let userID = this.authService.getToken().id;
    this.courses = this.courseService.getRegisteredCourses(userID);

    this.filteredCourses = this.control.valueChanges.pipe(
      startWith(''),
      flatMap(value => this._filter(value))
    );
  }

  private _filter(value: string): Observable<Course[]> {
    const filterValue = this._normalizeValue(value);
    return this.courses.pipe(
      flatMap(courseList => {
        if (filterValue.length > 0) {
          return of(courseList.filter(course => this._normalizeValue(course.name).includes(filterValue)))
        } else {
          return this.courses
        }
      })
    )
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }
}

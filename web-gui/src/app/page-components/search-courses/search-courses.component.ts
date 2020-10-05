import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {flatMap, startWith} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {Router} from '@angular/router';
import {TitlebarService} from '../../service/titlebar.service';
import {CourseService} from "../../service/course.service";
import {Course} from "../../model/Course";

/**
 * Show all courses
 */
@Component({
  selector: 'app-search-courses',
  templateUrl: './search-courses.component.html',
  styleUrls: ['./search-courses.component.scss']
})
export class SearchCoursesComponent implements OnInit {
  constructor(private courseService: CourseService,
              private router: Router,
              private titlebar: TitlebarService) {
  }

  courses: Observable<Course[]> = of();
  filteredCourses: Observable<Course[]> = of();
  control: FormControl = new FormControl();

  ngOnInit() {
    this.titlebar.emitTitle('Kurs suchen');
    this.courses = this.courseService.getCourseList()

    this.filteredCourses = this.control.valueChanges.pipe(
      startWith(''),
      flatMap(value => this._filter(value))
    );
  }

  /**
   * Navigates to subbed course
   * @param courseId The course to go to
   */
  goToCourse(courseId: number) {
    this.router.navigate(['courses', courseId]);
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

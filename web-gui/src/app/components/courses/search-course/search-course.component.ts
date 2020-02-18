import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {flatMap, map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {TitlebarService} from '../../../service/titlebar.service';
import {DatabaseService} from '../../../service/database.service';
import {GeneralCourseInformation} from '../../../interfaces/HttpInterfaces';

/**
 * Show all courses user can join
 */
@Component({
  selector: 'app-search-course',
  templateUrl: './search-course.component.html',
  styleUrls: ['./search-course.component.scss']
})
export class SearchCourseComponent implements OnInit {

  constructor(private db: DatabaseService, private snackBar: MatSnackBar, private router: Router,
              private titlebar: TitlebarService) {
  }

  private courses: GeneralCourseInformation[];
  myControl: FormControl = new FormControl('');
  filteredOptions: Observable<GeneralCourseInformation[]>;

  cardCourses: GeneralCourseInformation[] = [];
  subCourses: GeneralCourseInformation[] = [];

  ngOnInit() {
    this.titlebar.emitTitle('Kurs suchen');

    this.db.getAllCourses().pipe(
      flatMap(courses => {
        this.courses = courses;
        this.filteredOptions = this.myControl.valueChanges
          .pipe(
            startWith<string | GeneralCourseInformation>(''),
            map(value => typeof value === 'string' ? value : value.course_name),
            map(name => name ? this._filter(name) : this.courses.slice())
          );
        return this.filteredOptions;
      })).subscribe(filteredCourses => {
      this.cardCourses = filteredCourses;
    });

    this.db.getSubscribedCourses().subscribe(subCourses => this.subCourses = subCourses);
  }

  /**
   * Show name of course in autocomplete input
   * @param course Course to show only name from
   */
  displayFn(course?: GeneralCourseInformation): string | undefined {
    return course ? course.course_name : undefined;
  }

  private _filter(name: string): GeneralCourseInformation[] {
    const filterValue = name.toLowerCase();

    return this.courses.filter(option => {
      if (option.course_modul_id) {
        // Filter for course and module id
        return option.course_name.toLowerCase().indexOf(filterValue) >= 0 ||
          option.course_modul_id.toLowerCase().indexOf(filterValue) >= 0;
      } else {
        // filter only for course name
        return option.course_name.toLowerCase().indexOf(filterValue) >= 0;
      }
    });
  }

  /**
   * Subscribe to course
   * @param coursename Name of course
   * @param courseID The id of course to subscribe
   */
  joinCourse(coursename: string, courseID: number) {
    this.db.subscribeCourse(courseID).pipe(
      flatMap(msg => {
        if (msg.success) {
          this.snackBar.open('Kurs ' + coursename + ' beigetreten', 'OK', {duration: 3000});
        }
        return this.db.getSubscribedCourses();
      })
    ).subscribe(courses => {
        this.subCourses = courses;
      }
    );
  }

  /**
   * Navigates to subbed course
   * @param courseID The course to go to
   */
  goToCourse(courseID: number) {
    this.router.navigate(['courses', courseID]);
  }

  /**
   * Check if course is already subbed
   * @param courseID The id to check for
   */
  hasSubbed(courseID: number): boolean {
    let isSub = false;
    this.subCourses.find(subCourse => {
      isSub = subCourse.course_id === courseID;
      return isSub;
    });
    return isSub;
  }
}

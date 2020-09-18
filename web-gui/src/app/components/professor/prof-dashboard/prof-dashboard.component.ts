import {Component, OnInit} from '@angular/core';
import {DatabaseService} from '../../../service/database.service';
import {Observable, of} from 'rxjs';
import {CourseTask, DashboardProf, GeneralCourseInformation} from '../../../interfaces/HttpInterfaces';
import {TitlebarService} from '../../../service/titlebar.service';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {FormControl} from '@angular/forms';
import {UserService} from '../../../service/user.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {flatMap} from 'rxjs/operators';

/**
 * Matrix for every course docent a has
 */
@Component({
  selector: 'app-prof-dashboard',
  templateUrl: './prof-dashboard.component.html',
  styleUrls: ['./prof-dashboard.component.scss']
})
export class ProfDashboardComponent implements OnInit {

  constructor(private db: DatabaseService, private tb: TitlebarService,
              private userService: UserService, private snackbar: MatSnackBar) {
  }

  courses: GeneralCourseInformation[];
  matrix: DashboardProf[];
  tasks: CourseTask[];
  keys = Object.keys;
  filter = new FormControl();
  csvLoading = false;
  limit = 10;
  offset = 0;
  currentCourse = -1;
  userlength = 0;

  ngOnInit(): void {
    this.matrix = [];
    this.tasks = [];
    this.filter.valueChanges.subscribe(
      (value) => {
        this.onFilterChange(value);
      }
    );

    this.tb.emitTitle('Dashboard');
    this.db.getSubscribedCourses().subscribe(courses => {
      if (this.userService.getUserRole() === 4) {
        this.courses = courses.filter(course => course.role_id === 4);
      } else { // implicit does it means it is an admin, maybe also explizit allow moderators
        this.courses = courses;
      }
    });
  }

  onFilterChange(payload: string) {
    if (payload != null) {
      this.loadAllSubmissionsAtCurrent(this.currentCourse, payload);
    }
  }

  exportCourse(courseID: number) {
    console.log(courseID);
    this.csvLoading = true;
    this.db.getAllUserSubmissionsAsCSV(courseID).then(() => {
      this.csvLoading = false;
    }).catch(() => {
      this.csvLoading = false;
      this.snackbar.open('Export failed', 'OK', {duration: 3000});
    });
  }

  public loadAllSubmissionsAtCurrent(courseid: number, filter: string = '') {
    this.matrix = [];
    this.currentCourse = courseid;
    return new Promise((resolve) => {
      this.db.getCourseDetail(courseid, false).pipe(flatMap(course => {
        this.tasks = course.tasks;
        return this.db.getAllUserSubmissions(courseid, this.offset, this.limit, filter);
      })).subscribe(students => {
        this.matrix = students;
        resolve(true);
      });
    });
  }

  /**
   * Pagination event
   * @param $event The object that holds the pagination properties
   */
  pageEvent($event) {
    this.limit = $event.pageSize;
    this.offset = $event.pageIndex * this.limit;
    this.loadAllSubmissionsAtCurrent(this.currentCourse, '');
  }

  /**
   * Resets loaded data, pagination settings and filters.
   */
  private reset() {
    this.matrix = [];
    this.tasks = [];
    this.offset = 0;
    this.filter.reset();
  }

  /**
   * Load matrix for the right tab. Every tab represents a course
   * @param event The event when tab changes
   */
  tabChanged(event: MatTabChangeEvent) {
    this.reset();
    const course = this.courses.find(value => {
      return value.course_name === event.tab.textLabel;
    });
    this.db.getSubscribedUsersOfCourse(course.course_id)
      .subscribe(
      result => { this.userlength = result.length; },
      console.error,
      () => this.loadAllSubmissionsAtCurrent(course.course_id, ''));
  }
}

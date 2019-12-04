import {Component, OnInit} from '@angular/core';
import {DatabaseService} from '../../../service/database.service';
import {Observable} from 'rxjs';
import {CourseTask, DashboardProf, GeneralCourseInformation} from '../../../interfaces/HttpInterfaces';
import {TitlebarService} from '../../../service/titlebar.service';
import {MatTabChangeEvent} from '@angular/material';
import {map, startWith} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {UserService} from "../../../service/user.service";

/**
 * Matrix for every course docent has
 */
@Component({
  selector: 'app-prof-dashboard',
  templateUrl: './prof-dashboard.component.html',
  styleUrls: ['./prof-dashboard.component.scss']
})
export class ProfDashboardComponent implements OnInit {

  constructor(private db: DatabaseService, private tb: TitlebarService, private userService: UserService) {
  }

  courses: GeneralCourseInformation[];
  matrix?: DashboardProf[];
  filteredMatrix$: Observable<DashboardProf[]>;
  keys = Object.keys;
  filter = new FormControl();
  limit: number = 10;
  offset: number = 0;
  currentCourse: number = -1;
  userlength: number = 0;
  loading: boolean = true;


  private _filter(value: string): DashboardProf[] {
    const filterValue = value.toLowerCase().replace(' ', '');

    return this.matrix.filter(student => {
      return student.surname.toLowerCase().concat(student.prename.toLowerCase()).replace(' ', '').includes(filterValue) ||
        student.prename.toLowerCase().concat(student.surname.toLowerCase()).replace(' ', '').includes(filterValue);
    });

  }

  ngOnInit(): void {
    this.matrix = [];

    this.filteredMatrix$ = this.filter.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );


    this.tb.emitTitle('Dashboard');
    this.db.getSubscribedCourses().subscribe(courses => {
      if(this.userService.getUserRole() === 4) {
        this.courses = courses.filter(course => course.role_id === 4);
      } else { //implicit does it means it is an admin, maybe also explizit allow moderators
        this.courses = courses;
      }

    });
  }

  plagiatColor(task: CourseTask): string {
    if (task.plagiat_passed == null) {
      return "null"
    } else {
      return task.plagiat_passed
    }
  }

  public loadAllSubmissionsAtCurrent(courseid: number){
    this.currentCourse = courseid;
    this.db.getAllUserSubmissions(courseid, this.offset, this.limit).subscribe(students => {
      this.matrix = students;
      this.loading = false;
      // update filter to show values in filtered Matrix (Bug hack)
      this.filter.setValue(' ');
      this.filter.setValue('');
    });
  }

  public reloadSubmission(dir: number){
    this.offset = this.offset + (dir * this.limit);
    this.loadAllSubmissionsAtCurrent(this.currentCourse);
  }

  private truncateTap(){
    this.matrix = [];
    // update filter to show values in filtered Matrix (Bug hack)
    this.filter.setValue(' ');
    this.filter.setValue('');
    this.loading = true;
  }
  /**
   * Load matrix for the right tab. Every tab represents a course
   * @param event The event when tab changes
   */
  tabChanged(event: MatTabChangeEvent) {
    this.truncateTap();
    this.offset = 0;
    const course = this.courses.find(value => {
      return value.course_name === event.tab.textLabel;
    });

    this.db.getSubscribedUsersOfCourse(course.course_id).subscribe(
      result => {this.userlength = result.length},
      error => {},
      () => this.loadAllSubmissionsAtCurrent(course.course_id)
    )

  }

}

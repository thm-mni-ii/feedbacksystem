import {Component, OnInit} from '@angular/core';
import {DatabaseService} from '../../../service/database.service';
import {Observable} from 'rxjs';
import {DashboardProf, GeneralCourseInformation} from '../../../interfaces/HttpInterfaces';
import {TitlebarService} from '../../../service/titlebar.service';
import {MatTabChangeEvent} from '@angular/material';
import {map, startWith} from 'rxjs/operators';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-prof-dashboard',
  templateUrl: './prof-dashboard.component.html',
  styleUrls: ['./prof-dashboard.component.scss']
})
export class ProfDashboardComponent implements OnInit {

  constructor(private db: DatabaseService, private tb: TitlebarService) {
  }

  courses: GeneralCourseInformation[];
  matrix?: DashboardProf[];
  filteredMatrix$: Observable<DashboardProf[]>;
  keys = Object.keys;
  filter = new FormControl();


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
      this.courses = courses;
    });
  }


  /**
   * Load matrix for the right course. Every tab represents a course
   * @param event The event when tab changes
   */
  tabChanged(event: MatTabChangeEvent) {
    const course = this.courses.find(value => {
      return value.course_name === event.tab.textLabel;
    });

    this.db.getAllUserSubmissions(course.course_id).subscribe(students => {
      this.matrix = students;
      // update filter to show values in filtered Matrix
      this.filter.setValue(' ');
      this.filter.setValue('');
    });


  }

}

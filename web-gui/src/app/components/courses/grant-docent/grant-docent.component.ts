import {Component, OnInit, ViewChild} from '@angular/core';
import {MatAutocomplete, MatSort, MatTableDataSource} from '@angular/material';
import {GeneralCourseInformation, User} from '../../../interfaces/HttpInterfaces';
import {DatabaseService} from '../../../service/database.service';

/**
 * Adding and removing docents from courses
 */
@Component({
  selector: 'app-grant-docent',
  templateUrl: './grant-docent.component.html',
  styleUrls: ['./grant-docent.component.scss']
})
export class GrantDocentComponent implements OnInit {

  constructor(private db: DatabaseService) {
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  dataSourceCourses = new MatTableDataSource<GeneralCourseInformation>();
  columns = ['course_name'];

  public loadAllCourses() {
    this.db.getAllCourses().subscribe(courses => this.dataSourceCourses.data = courses);
  }

  ngOnInit() {
    this.loadAllCourses();
    this.dataSourceCourses.sort = this.sort;
  }

  /**
   * Filters all courses
   * @param filterValue The value to filter with
   */
  filterCourses(filterValue: string) {
    this.dataSourceCourses.filter = filterValue;
  }
}

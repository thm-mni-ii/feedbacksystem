import {Component, OnInit} from '@angular/core';
import {CourseTableDataSource, CourseTableItem} from './course-table-datasource';
import {DatabaseService} from "../../../../service/database.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-course-table',
  templateUrl: './course-table.component.html',
  styleUrls: ['./course-table.component.scss'],
})
export class CourseTableComponent implements OnInit {

  dataSource: CourseTableDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['name'];


  constructor(private db: DatabaseService, private router: Router) {
  }

  ngOnInit() {
    this.dataSource = new CourseTableDataSource(this.db);
    this.dataSource.loadCourses();
  }

  /**
   * Get row of course that was selected
   * and navigate to course
   * @param row of course that is selected
   */
  getRow(row: CourseTableItem) {
    this.router.navigate(['user/course', row.course_id]).catch(reason => console.log(reason));
  }
}

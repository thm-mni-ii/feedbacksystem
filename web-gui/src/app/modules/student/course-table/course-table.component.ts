import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort} from '@angular/material';
import {CourseTableDataSource} from './course-table-datasource';

@Component({
  selector: 'app-course-table',
  templateUrl: './course-table.component.html',
  styleUrls: ['./course-table.component.scss'],
})
export class CourseTableComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: CourseTableDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['name', 'id'];

  ngOnInit() {
    this.dataSource = new CourseTableDataSource(this.paginator, this.sort);
  }

  /**
   * Get row of course that was selected
   * @param row of course that is selected
   */
  getRow(row) {
    //TODO: Implement routing to right course.
    console.log(row);
  }
}

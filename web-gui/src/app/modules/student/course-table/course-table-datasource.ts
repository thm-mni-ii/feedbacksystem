import {DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs';
import {DatabaseService} from "../../../service/database.service";

export interface CourseTableItem {
  course_description: string;
  role_id: string;
  role_name: string;
  course_name: string;
  course_id: string;
}


/**
 * Data source for the CourseTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class CourseTableDataSource extends DataSource<CourseTableItem> {

  constructor(private db: DatabaseService) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<CourseTableItem[]> {
    return this.db.getCourses();
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {
  }
}

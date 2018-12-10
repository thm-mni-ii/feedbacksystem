import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {BehaviorSubject, Observable} from 'rxjs';
import {DatabaseService} from "../../../../service/database.service";


export interface CourseTableItem {
  course_description: string;
  role_id: number;
  role_name: string;
  course_name: string;
  course_id: number;
}


/**
 * Data source for the CourseTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class CourseTableDataSource extends DataSource<CourseTableItem> {

  private courseSubject = new BehaviorSubject<CourseTableItem[]>([]);

  constructor(private db: DatabaseService) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(collectionViewer: CollectionViewer): Observable<CourseTableItem[] | ReadonlyArray<CourseTableItem>> {
    return this.courseSubject.asObservable();
  }


  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect(collectionViewer: CollectionViewer): void {
    this.courseSubject.complete();
  }


  /**
   * Load courses and emit new values.
   */
  loadCourses() {
    this.db.getCourses().subscribe(value => {
      console.log(value);
      this.courseSubject.next(value);
    });
  }

}

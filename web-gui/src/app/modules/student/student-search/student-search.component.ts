import {Component, OnDestroy, OnInit} from '@angular/core';
import {CourseTableItem} from "../course-table/course-table-datasource";
import {DatabaseService} from "../../../service/database.service";
import {Subscription} from "rxjs";

/**
 * Component for searching for courses.
 */
@Component({
  selector: 'app-student-search',
  templateUrl: './student-search.component.html',
  styleUrls: ['./student-search.component.scss']
})
export class StudentSearchComponent implements OnInit, OnDestroy {

  allCourses: CourseTableItem[];
  courseSubscription: Subscription;

  constructor(private db: DatabaseService) {
  }

  ngOnInit() {
    //TODO: Change getAllCourses with Route that gives only unsubbed courses back
    this.courseSubscription = this.db.getAllCourses().subscribe(courses => {
      this.allCourses = courses;
    });
  }

  ngOnDestroy(): void {
    this.courseSubscription.unsubscribe();
  }

  subscribeToCourse(id: number) {
    let sub = this.db.subscribeCourse(id).subscribe(
      () => {
      },
      error => {
        console.log(error)
      },
      () => {
        sub.unsubscribe();
      });
  }

}

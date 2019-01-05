import {Component, OnDestroy, OnInit} from '@angular/core';
import {CourseTableItem} from "../../student/student-list/course-table/course-table-datasource";
import {DatabaseService} from "../../../service/database.service";
import {Subscription} from "rxjs";

/**
 * Component that shows all courses the
 * lecturer has
 */
@Component({
  selector: 'app-prof-courses',
  templateUrl: './prof-courses.component.html',
  styleUrls: ['./prof-courses.component.scss']
})
export class ProfCoursesComponent implements OnInit, OnDestroy {

  private coursesSub: Subscription;
  courses: CourseTableItem[];
  courseName: string;
  courseDescription: string;


  constructor(private db: DatabaseService) {
  }

  ngOnInit() {
    this.coursesSub = this.db.getCourses().subscribe(courses => {
      this.courses = courses;
    });
  }

  ngOnDestroy(): void {
    this.coursesSub.unsubscribe();
  }

  /**
   * Lecturer updates a course
   * @param id of course to update
   */
  updateCourse(id: number) {
    //TODO: Select right standard task type
    this.db.updateCourse(id, this.courseName, this.courseDescription, 0).subscribe(result => {
    });
  }

}

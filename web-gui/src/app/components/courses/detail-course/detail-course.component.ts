import {Component, OnInit} from '@angular/core';
import {flatMap} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {CourseDetail, DatabaseService, Task} from '../../../service/database.service';
import {TitlebarService} from '../../../service/titlebar.service';

@Component({
  selector: 'app-detail-course',
  templateUrl: './detail-course.component.html',
  styleUrls: ['./detail-course.component.scss']
})
export class DetailCourseComponent implements OnInit {

  courseDetail: CourseDetail;
  courseTasks: Task[];

  constructor(private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService) {
  }

  ngOnInit() {
    this.route.params.pipe(
      flatMap(params => {
        const id = +params['id'];
        return this.db.getCourseDetail(id);
      })
    ).subscribe(course_detail => {
      this.courseDetail = course_detail;
      this.courseTasks = course_detail.tasks;
      this.titlebar.emitTitle(course_detail.course_name);
    });
  }

}

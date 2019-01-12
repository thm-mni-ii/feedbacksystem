import {Component, OnInit} from '@angular/core';
import {TitlebarService} from '../../service/titlebar.service';
import {CourseTableItem, DatabaseService} from '../../service/database.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {

  constructor(private titlebar: TitlebarService, private db: DatabaseService, private router: Router) {
  }

  userCourses$: Observable<CourseTableItem[]>;

  ngOnInit() {
    this.titlebar.emitTitle('Meine Kurse');
    this.userCourses$ = this.db.getUserCourses();

  }


  goToCourse(courseID: number) {
    this.router.navigate(['courses', courseID]);
  }
}

import {Component, OnInit} from '@angular/core';
import {TitlebarService} from '../../service/titlebar.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {DatabaseService} from '../../service/database.service';
import {GeneralCourseInformation} from '../../interfaces/HttpInterfaces';

/**
 * Show all courses user subscribed
 */
@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {

  constructor(private titlebar: TitlebarService, private db: DatabaseService, private router: Router) {
  }

  userCourses$: Observable<GeneralCourseInformation[]>;

  ngOnInit() {
    this.titlebar.emitTitle('Meine Kurse');
    this.userCourses$ = this.db.getSubscribedCourses();

  }

  /**
   * Show course in detail
   * @param courseID The course to see in detail
   */
  goToCourse(courseID: number) {
    this.router.navigate(['courses', courseID]);
  }
}

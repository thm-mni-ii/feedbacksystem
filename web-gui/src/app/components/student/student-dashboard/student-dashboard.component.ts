import {Component, OnInit} from '@angular/core';
import {DatabaseService} from '../../../service/database.service';
import {CourseTask, DashboardStudent} from '../../../interfaces/HttpInterfaces';
import {TitlebarService} from '../../../service/titlebar.service';
import {Router} from '@angular/router';

/**
 * Student matrix for his subscribed courses
 */
@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss'],
})
export class StudentDashboardComponent implements OnInit {


  constructor(private db: DatabaseService, private tb: TitlebarService,
              private router: Router) {
  }

  dashboard?: DashboardStudent[];
  keys = Object.keys;


  ngOnInit() {
    this.tb.emitTitle('Dashboard');
    this.db.getOverview().subscribe(value => {
      this.dashboard = value;
    });
  }

  /**
   * Navigates to course
   * @param courseID The id of course to navigate to
   * @param taskID The id of task to scroll after navigate
   */
  goToTask(courseID: number, taskID: string) {
    this.router.navigate(['courses', courseID], {fragment: taskID});
  }

  plagiatColor(task: CourseTask): string {
    if (task.plagiat_passed == null) {
      return "null"
    } else {
      return task.plagiat_passed
    }
  }

}

import {Component, OnDestroy, OnInit} from '@angular/core';
import {CourseTableItem, DatabaseService, ProfDashboard} from '../../../service/database.service';
import {Subscription} from 'rxjs';
import {MatTabChangeEvent} from '@angular/material';

@Component({
  selector: 'app-prof-dashboard',
  templateUrl: './prof-dashboard.component.html',
  styleUrls: ['./prof-dashboard.component.scss']
})
export class ProfDashboardComponent implements OnInit, OnDestroy {

  constructor(private db: DatabaseService) {
  }

  private profCourseSub: Subscription;

  profCourses: CourseTableItem[];
  dashboardInfo?: ProfDashboard;
  displayedColumns = ['prename', 'surname', 'result', 'passed'];


  ngOnInit() {
    this.profCourseSub = this.db.getUserCourses().subscribe(courses => {
      this.profCourses = courses;
    });
  }

  ngOnDestroy(): void {
    this.profCourseSub.unsubscribe();
  }

  onTabChange(event: MatTabChangeEvent) {
    this.getDetails(this.profCourses.find(value => value.course_name === event.tab.textLabel).course_id);
  }


  private getDetails(courseID: number) {
    this.db.getAllUserSubmissions(courseID).subscribe(info => {
      this.dashboardInfo = info[0];
    });
  }

}

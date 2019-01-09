import {Component, OnDestroy, OnInit} from '@angular/core';
import {DashboardInformation, DatabaseService} from "../../../service/database.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit, OnDestroy {

  dashInfoSub: Subscription;
  infos: DashboardInformation[];

  constructor(private db: DatabaseService) {
  }

  ngOnInit() {
    this.dashInfoSub = this.db.getOverview().subscribe(dashInfos => {
      this.infos = dashInfos;
    });
  }

  ngOnDestroy(): void {
    this.dashInfoSub.unsubscribe();
  }


}

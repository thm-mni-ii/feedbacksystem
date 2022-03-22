import {Component, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Task} from '../../../model/Task';
import {UserTaskResult} from '../../../model/UserTaskResult';
import {Course} from '../../../model/Course';
import {TaskService} from '../../../service/task.service';
import {AuthService} from '../../../service/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TitlebarService} from '../../../service/titlebar.service';
import {ExternalClassroomService} from '../../../service/external-classroom.service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CourseService} from '../../../service/course.service';
import {CourseRegistrationService} from '../../../service/course-registration.service';
import {FeedbackAppService} from '../../../service/feedback-app.service';
import {GoToService} from '../../../service/goto.service';
import {CheckerService} from '../../../service/checker.service';
import {DOCUMENT} from '@angular/common';
import {Roles} from '../../../model/Roles';
import {ChartType, ChartOptions, ChartColor} from 'chart.js';
import {SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, Color} from 'ng2-charts';
import {WrongTables} from '../../../model/wrongTables';
import {RightTables} from '../../../model/rightTables';
import {MatSort, Sort} from '@angular/material/sort';
import {SqlCheckerService} from '../../../service/sql-checker.service';
import {SumUp} from '../../../model/SumUp';
import {SqlCheckerResult} from '../../../model/SqlCheckerResult';
import {map} from 'rxjs/operators';


@Component({
  selector: 'app-sql-checker-results',
  templateUrl: './sql-checker-results.component.html',
  styleUrls: ['./sql-checker-results.component.scss']
})

export class SqlCheckerResultsComponent {
  constructor(private taskService: TaskService,
              private authService: AuthService,
              private route: ActivatedRoute,
              private titlebar: TitlebarService,
              public externalClassroomService: ExternalClassroomService,
              private dialog: MatDialog,
              private auth: AuthService,
              private snackbar: MatSnackBar,
              private router: Router,
              private courseService: CourseService,
              private courseRegistrationService: CourseRegistrationService,
              private feedbackAppService: FeedbackAppService,
              private goToService: GoToService,
              private checkerService: CheckerService,
              private sqlcheckerService: SqlCheckerService,
              @Inject(DOCUMENT) document) {
  }
  // Chart generally
  public pieChartColors: Array < any > = [{
    backgroundColor: ['#405e9a', '#aab6fe'],
  }];
  // Left chart
  pieChartOptionsLeft: ChartOptions = {
    responsive: true,
  };
  pieChartLabelsLeft: Label[] = [['Korrekte Tabellen'], ['Falsche Tabellen']];
  pieChartDataLeft: SingleDataSet = [];
  pieChartTypeLeft: ChartType = 'pie';
  pieChartLegendLeft = true;
  pieChartPluginsLeft = [];
  leftChartSum: Observable<SumUp[]> = of();
  leftChartCountRight: number[];
  leftChartCountFalse: number[];
  // Right chart
  pieChartOptionsRight: ChartOptions = {
    responsive: true,
  };
  pieChartLabelsRight: Label[] = [['Korrekte Attribute'], ['Falsche Attribute']];
  pieChartDataRight: SingleDataSet[];
  pieChartTypeRight: ChartType = 'pie';
  pieChartLegendRight = true;
  pieChartPluginsRight = [];
  rightChartSum: Observable<SumUp[]> = of();
  rightChartCountRight: number[];
  rightChartCountFalse: number[];
  // Center chart
  pieChartOptionsCenter: ChartOptions = {
    maintainAspectRatio: true,
    responsive: true,
  };
  pieChartLabelsCenter: Label[];
  pieChartDataCenter: SingleDataSet = [];
  pieChartTypeCenter: ChartType = 'pie';
  pieChartLegendCenter = true;
  pieChartPluginsCenter = [];
  centerChartSum: Observable<SumUp[]> = of();
  centerChartCountRight: number[];
  centerChartCountFalse: number[];
  // Tables
  displayedColumnsWrongTable: string[];
  dataSource: any;
  // End of Tables
  courseID: number;
  tasks: Task[];
  taskResults: Record<number, UserTaskResult>;
  role: string = null;
  course: Observable<Course> = of();
  openConferences: Observable<string[]>;
  taskID: number;
  showRight;
  showLeft;
  showCenterTableChecker;
  showCenterAttributeChecker;
  showTableCheckerWrongTables;
  showBack;
  showTableCheckerRightTables;
  showTableCheckerRightTablesRightAttribute;
  showTableCheckerRightTablesWrongAttribute;
  showAttributeCheckerWrongAttribute;
  showAttributeCheckerRightAttribute;
  showAttributeCheckerRightAttributeRightTable;
  showAttributeCheckerRightAttributeWrongTable;
  showPath;
  solution;
  //Daten
  wrongTable: Observable<SqlCheckerResult[]> = of();
  rightTable: Observable<SqlCheckerResult[]> = of();
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this.route.params.subscribe(
      param => {
        this.courseID = param.id;
        this.taskID = param.tid;
      }
    );
    console.log('hi');
    console.log(this.taskID);
    this.standardEvent();
      this.taskService.getAllTasks(this.courseID).subscribe(tasks => {
        this.taskService.getTaskResults(this.courseID).subscribe(taskResults => {
          this.tasks = tasks;
          this.taskResults = taskResults.reduce((acc, res) => {acc[res.taskID] = res; return acc; }, {});
        });
      });
      this.role = this.auth.getToken().courseRoles[this.courseID];
      if (this.goToService.getAndClearAutoJoin() && !this.role) {
        this.courseRegistrationService.registerCourse( this.authService.getToken().id, this.courseID)
          .subscribe(() => this.courseService.getCourse(this.courseID).subscribe(() => this.ngOnInit())
            , error => console.error(error));
      }
    }

  public isAuthorized(ignoreTutor: boolean = false) {
      const token = this.auth.getToken();
      const courseRole = token.courseRoles[this.courseID];
      const globalRole = token.globalRole;
      return Roles.GlobalRole.isAdmin(globalRole) || Roles.GlobalRole.isModerator(globalRole)
        || Roles.CourseRole.isDocent(courseRole) || (Roles.CourseRole.isTutor(courseRole) && !ignoreTutor);
    }
    private standardEvent() {
      this.showTableCheckerRightTablesRightAttribute = false;
      this.showCenterTableChecker = false;
      this.showCenterAttributeChecker = false;
      this.showRight = true;
      this.showLeft = true;
      this.showTableCheckerWrongTables = false;
      this.showTableCheckerRightTablesWrongAttribute = false;
      this.showAttributeCheckerWrongAttribute = false;
      this.showAttributeCheckerRightAttributeRightTable = false;
      this.showAttributeCheckerRightAttributeWrongTable = false;
      this.showBack = false;
      this.showPath = '';
      this.leftChartSum = this.sqlcheckerService.getSumUpCorrect(this.taskID, 'tables');
      this.rightChartSum = this.sqlcheckerService.getSumUpCorrect(this.taskID, 'attributes');
      this.leftChartSum.pipe(map(s => s.map(u => u.trueCount))).subscribe(sum => this.leftChartCountRight = sum);
      this.leftChartSum.pipe(map(s => s.map(u => u.falseCount))).subscribe(sum => this.leftChartCountFalse = sum);
      this.rightChartSum.pipe(map(s => s.map(u => u.trueCount))).subscribe(sum => this.rightChartCountRight = sum);
      this.rightChartSum.pipe(map(s => s.map(u => u.falseCount))).subscribe(sum => this.rightChartCountFalse = sum);
      this.pieChartDataLeft = [this.leftChartCountRight, this.leftChartCountFalse];
      this.pieChartDataRight = [this.rightChartCountRight, this.rightChartCountFalse];
    }
  private tableCheckerWrongTables(e: any) {
    e = e.active[0]._index;
    if (e === 0) {this.tableCheckerRightTables(); } else {
      this.wrongTable = this.sqlcheckerService.getListByType(this.taskID, 'tables');
      this.showPath = 'Falsche Tabellen';
      this.showTableCheckerWrongTables = true;
      this.showLeft = false;
      this.showRight = false;
      this.displayedColumnsWrongTable = ['userID', 'userQuery'];
      this.dataSource = this.wrongTable;
      }
  }
  private tableCheckerRightTables() {
    this.showPath = 'Korrekte Tabellen';
    this.showRight = false;
    this.showLeft = false;
    this.showCenterTableChecker = true;
    this.showTableCheckerRightTables = true;
    this.pieChartLabelsCenter = [['Korrekte Tabellen korrekte Attribute'], ['Korrekte Tabellen falsche Attribute']];
    this.centerChartSum = this.sqlcheckerService.getSumUpCorrectCombined(this.taskID, 'tables');
    this.centerChartSum.pipe(map(s => s.map(u => u.trueCount))).subscribe(sum => this.centerChartCountRight = sum);
    this.centerChartSum.pipe(map(s => s.map(u => u.falseCount))).subscribe(sum => this.centerChartCountFalse = sum);
    this.pieChartDataCenter = [this.centerChartCountRight, this.centerChartCountFalse];
  }
  private clickCenterChartTableChecker (e: any) {
    e = e.active[0]._index;
    if (this.showTableCheckerRightTables) {
      if ( e === 0) {
        this.showPath = 'Korrekte Tabellen ➔ korrekte Attribute';
        this.showTableCheckerRightTablesRightAttribute = true;
        this.showCenterTableChecker = false;
        this.displayedColumnsWrongTable = ['userID', 'userQuery'];
        this.rightTable = this.sqlcheckerService.getListByTypes(this.taskID, true, true);
      }
    } if ( e === 1) {
      this.showPath = 'Korrekte Tabellen ➔ falsche Attribute';
      this.showTableCheckerRightTablesWrongAttribute = true;
      this.showCenterTableChecker = false;
      this.displayedColumnsWrongTable = ['userID', 'userQuery'];
      this.rightTable = this.sqlcheckerService.getListByTypes(this.taskID, true, false);
    }
  }
  private clickAttributeChart(e: any) {
    e = e.active[0]._index;
    if (e === 0 ) {this.attributeCheckerRightAttribute(); } else {
      this.showPath = 'Falsche Attribute';
      this.showRight = false;
      this.showLeft = false;
      this.showAttributeCheckerWrongAttribute = true;
      this.displayedColumnsWrongTable = ['userID', 'userQuery'];
      this.rightTable = this.sqlcheckerService.getListByType(this.taskID, 'attributes');
    }
  }
  private attributeCheckerRightAttribute() {
    this.showPath = 'Korrekte Attribute';
    this.showRight = false;
    this.showLeft = false;
    this.showCenterAttributeChecker = true;
    this.showAttributeCheckerRightAttribute = true;
    this.pieChartLabelsCenter = [['Korrekte Attribute korrekte Tabellen'], ['Korrekte Attribute falsche Tabellen']];
    this.centerChartSum = this.sqlcheckerService.getSumUpCorrectCombined(this.taskID, 'attributes');
    this.centerChartSum.pipe(map(s => s.map(u => u.trueCount))).subscribe(sum => this.centerChartCountRight = sum);
    this.centerChartSum.pipe(map(s => s.map(u => u.falseCount))).subscribe(sum => this.centerChartCountFalse = sum);
    this.pieChartDataCenter = [this.centerChartCountRight, this.centerChartCountFalse];
  }
  private clickCenterChartAttributeChecker (e: any) {
    e = e.active[0]._index;
      if ( e === 0) {
        this.showPath = 'Korrekte Attribute ➔ korrekte Tabellen';
        this.showAttributeCheckerRightAttributeRightTable = true;
        this.showCenterAttributeChecker  = false;
        this.displayedColumnsWrongTable = ['userID', 'userQuery'];
        this.rightTable = this.sqlcheckerService.getListByTypes(this.taskID, true, true);
      }
     if ( e === 1) {
       this.showPath = 'Korrekte Attribute ➔ falsche Tabellen';
      this.showAttributeCheckerRightAttributeWrongTable = true;
      this.showCenterAttributeChecker = false;
       this.displayedColumnsWrongTable = ['userID', 'userQuery'];
       this.wrongTable = this.sqlcheckerService.getListByTypes(this.taskID, false, true);
    }
  }
}



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
  pieChartDataLeft: SingleDataSet = [5, 4];
  pieChartTypeLeft: ChartType = 'pie';
  pieChartLegendLeft = true;
  pieChartPluginsLeft = [];
  // Right chart
  pieChartOptionsRight: ChartOptions = {
    responsive: true,
  };
  pieChartLabelsRight: Label[] = [['Korrekte Attribute'], ['Falsche Attribute']];
  pieChartDataRight: SingleDataSet = [6, 3];
  pieChartTypeRight: ChartType = 'pie';
  pieChartLegendRight = true;
  pieChartPluginsRight = [];
  // Center chart
  pieChartOptionsCenter: ChartOptions = {
    maintainAspectRatio: true,
    responsive: true,
  };
  pieChartLabelsCenter: Label[];
  pieChartDataCenter: SingleDataSet = [4, 6];
  pieChartTypeCenter: ChartType = 'pie';
  pieChartLegendCenter = true;
  pieChartPluginsCenter = [];
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
  // Testdaten
  wrongTable: WrongTables[];
  rightTable: RightTables[];
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this.standardEvent();
      this.route.params.subscribe(
        param => {
          this.courseID = param.id;
          this.taskID = param.tid;
        }
      );
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
    }
  private tableCheckerWrongTables(e: any) {
    e = e.active[0]._index;
    if (e === 0) {this.tableCheckerRightTables(); } else {
      this.showPath = 'Falsche Tabellen';
      this.showTableCheckerWrongTables = true;
      this.showLeft = false;
      this.showRight = false;
      this.displayedColumnsWrongTable = ['userID', 'userQuery'];
      this.wrongTable = [
        {taskID: 1, rightQuery: 'Select Name from Studierende where vorname="Sandra"',
           userID: 1, userQuery: 'Select Name from Mitarbeiter'},
        {taskID: 1, rightQuery: '', userID: 2, userQuery: 'Select * from Mitarbeiter where vorname="Sandra"'},
        {taskID: 1, rightQuery: '', userID: 3, userQuery: 'Select * from Mitarbeiter'},
        {taskID: 1, rightQuery: '', userID: 4, userQuery: 'Select Vorname from Mitarbeiter where vorname="Sandra"'},
      ];
      this.solution = this.wrongTable[0].rightQuery;
      this.dataSource = this.wrongTable;
      }
  }
  private tableCheckerRightTables() {
    this.showPath = 'Korrekte Tabellen';
    this.showRight = false;
    this.showLeft = false;
    this.showCenterTableChecker = true;
    this.showTableCheckerRightTables = true;
    this.pieChartDataCenter = [2, 3];
    this.pieChartLabelsCenter = [['Korrekte Tabellen korrekte Attribute'], ['Korrekte Tabellen falsche Attribute']];
  }
  private clickCenterChartTableChecker (e: any) {
    e = e.active[0]._index;
    if (this.showTableCheckerRightTables) {
      if ( e === 0) {
        this.showPath = 'Korrekte Tabellen ➔ korrekte Attribute';
        this.showTableCheckerRightTablesRightAttribute = true;
        this.showCenterTableChecker = false;
        this.displayedColumnsWrongTable = ['userID', 'userQuery'];
        this.rightTable = [
          {taskID: 1, rightQuery: 'Select Name from Studierende where vorname="Sandra"', userID: 1, userQuery: 'Select Name from Studierende where vorname=Sandra Group By Nachname'},
          {taskID: 1, rightQuery: '', userID: 2, userQuery: 'Select Name from Studierende where vorname=Sandra Group By Creditpoints'},
        ];
        this.solution = this.rightTable[0].rightQuery;
      }
    } if ( e === 1) {
      this.showPath = 'Korrekte Tabellen ➔ falsche Attribute';
      this.showTableCheckerRightTablesWrongAttribute = true;
      this.showCenterTableChecker = false;
      this.displayedColumnsWrongTable = ['userID', 'userQuery'];
      this.rightTable = [
        {taskID: 1, rightQuery: 'Select Name from Studierende where vorname="Sandra"', userID: 1, userQuery: 'Select Geburtstag from Studierende where vorname=Sandra'},
        {taskID: 1, rightQuery: '', userID: 2, userQuery: 'Select Vorname from Studierende where vorname=Sandra'},
        {taskID: 1, rightQuery: '', userID: 3, userQuery: 'Select MatrikelNummer from Studierende where vorname=Sandra'},
      ];
      this.solution = this.rightTable[0].rightQuery;
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
      this.rightTable = [
        {taskID: 1, rightQuery: 'Select Name from Studierende where vorname="Sandra"', userID: 1, userQuery: 'Select Geburtstag from Studierende where vorname=Sandra'},
        {taskID: 1, rightQuery: '', userID: 2, userQuery: 'Select Vorname from Studierende where vorname=Sandra'},
        {taskID: 1, rightQuery: '', userID: 3, userQuery: 'Select MatrikelNummer from Studierende where vorname=Sandra'},
      ];
      this.solution = this.rightTable[0].rightQuery;
    }
  }
  private attributeCheckerRightAttribute() {
    this.showPath = 'Korrekte Attribute';
    this.showRight = false;
    this.showLeft = false;
    this.showCenterAttributeChecker = true;
    this.showAttributeCheckerRightAttribute = true;
    this.pieChartDataCenter = [3, 3];
    this.pieChartLabelsCenter = [['Korrekte Attribute korrekte Tabellen'], ['Korrekte Attribute falsche Tabellen']];
  }
  private clickCenterChartAttributeChecker (e: any) {
    e = e.active[0]._index;
      if ( e === 0) {
        this.showPath = 'Korrekte Attribute ➔ korrekte Tabellen';
        this.showAttributeCheckerRightAttributeRightTable = true;
        this.showCenterAttributeChecker  = false;
        this.displayedColumnsWrongTable = ['userID', 'userQuery'];
        this.rightTable = [
          {taskID: 1, rightQuery: 'Select Name from Studierende where vorname="Sandra"', userID: 1, userQuery: 'Select Name from Studierende where vorname="Sandra" Group By Nachname'},
          {taskID: 1, rightQuery: '', userID: 2, userQuery: 'Select Name from Studierende where vorname="Sandra" Group By Creditpoints'},
          {taskID: 1, rightQuery: '', userID: 3, userQuery: 'Select Name from Studierende where vorname="Sandra" Order By Geburtstag'},
        ];
        this.solution = this.rightTable[0].rightQuery;
      }
     if ( e === 1) {
       this.showPath = 'Korrekte Attribute ➔ falsche Tabellen';
      this.showAttributeCheckerRightAttributeWrongTable = true;
      this.showCenterAttributeChecker = false;
       this.displayedColumnsWrongTable = ['userID', 'userQuery'];
       this.wrongTable = [
         {taskID: 1, rightQuery: 'Select Name from Studierende where vorname="Sandra"', userID: 1,
           userQuery: 'Select Name from Mitarbeiter'},
         {taskID: 1, rightQuery: '', userID: 2, userQuery: 'Select Name from Mitarbeiter where vorname="Sandra"'},
         {taskID: 1, rightQuery: '', userID: 3, userQuery: 'Select Name from Mitarbeiter'},
       ];
       this.solution = this.wrongTable[0].rightQuery;
    }
  }
}



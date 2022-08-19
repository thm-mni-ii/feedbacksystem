import { Component, OnInit } from "@angular/core";
import { Observable, of } from "rxjs";
import { Task } from "../../../model/Task";
import { UserTaskResult } from "../../../model/UserTaskResult";
import { Course } from "../../../model/Course";
import { TaskService } from "../../../service/task.service";
import { AuthService } from "../../../service/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { TitlebarService } from "../../../service/titlebar.service";
import { ExternalClassroomService } from "../../../service/external-classroom.service";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CourseService } from "../../../service/course.service";
import { CourseRegistrationService } from "../../../service/course-registration.service";
import { FeedbackAppService } from "../../../service/feedback-app.service";
import { GoToService } from "../../../service/goto.service";
import { CheckerService } from "../../../service/checker.service";
import { Roles } from "../../../model/Roles";
import { ChartType, ChartOptions } from "chart.js";
import { SingleDataSet, Label } from "ng2-charts";
import { SqlCheckerService } from "../../../service/sql-checker.service";
import { SumUp } from "../../../model/SumUp";
import { SqlCheckerResult } from "../../../model/SqlCheckerResult";

@Component({
  selector: "app-sql-checker-results",
  templateUrl: "./sql-checker-results.component.html",
  styleUrls: ["./sql-checker-results.component.scss"],
})
export class SqlCheckerResultsComponent implements OnInit {
  constructor(
    private taskService: TaskService,
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
    private sqlcheckerService: SqlCheckerService
  ) {}
  // Chart generally
  public pieChartColors: Array<any> = [
    {
      backgroundColor: ["#405e9a", "#aab6fe"],
    },
  ];
  // Left chart
  pieChartOptionsLeft: ChartOptions = {
    responsive: true,
  };
  pieChartLabelsLeft: Label[] = [["Korrekte Tabellen"], ["Falsche Tabellen"]];
  pieChartDataLeft: SingleDataSet = [];
  pieChartTypeLeft: ChartType = "pie";
  pieChartLegendLeft = true;
  pieChartPluginsLeft = [];
  leftChartCountRight: number;
  leftChartCountFalse: number;
  // Right chart
  pieChartOptionsRight: ChartOptions = {
    responsive: true,
  };
  pieChartLabelsRight: Label[] = [
    ["Korrekte Attribute"],
    ["Falsche Attribute"],
  ];
  pieChartDataRight: SingleDataSet = [];
  pieChartTypeRight: ChartType = "pie";
  pieChartLegendRight = true;
  pieChartPluginsRight = [];
  // Center chart
  pieChartOptionsCenter: ChartOptions = {
    maintainAspectRatio: true,
    responsive: true,
  };
  pieChartLabelsCenter: Label[];
  pieChartDataCenter: SingleDataSet = [];
  pieChartTypeCenter: ChartType = "pie";
  pieChartLegendCenter = true;
  pieChartPluginsCenter = [];
  centerChartSum: Observable<SumUp> = of();
  // Tables
  displayedColumnsWrongTable: string[];
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
  showResult = false;
  resultTable;
  tableColumns;
  // Daten
  resultTableObs: Observable<SqlCheckerResult[]> = of();
  ngOnInit() {
    this.route.params.subscribe((param) => {
      this.courseID = param.id;
      this.taskID = param.tid;
    });
    this.standardEvent();
    this.role = this.auth.getToken().courseRoles[this.courseID];
    if (this.goToService.getAndClearAutoJoin() && !this.role) {
      this.courseRegistrationService
        .registerCourse(this.authService.getToken().id, this.courseID)
        .subscribe(
          () =>
            this.courseService
              .getCourse(this.courseID)
              .subscribe(() => this.ngOnInit()),
          (error) => console.error(error)
        );
    }
  }
  public isAuthorized(ignoreTutor: boolean = false) {
    const token = this.auth.getToken();
    const courseRole = token.courseRoles[this.courseID];
    const globalRole = token.globalRole;
    return (
      Roles.GlobalRole.isAdmin(globalRole) ||
      Roles.GlobalRole.isModerator(globalRole) ||
      Roles.CourseRole.isDocent(courseRole) ||
      (Roles.CourseRole.isTutor(courseRole) && !ignoreTutor)
    );
  }
  private standardEvent() {
    this.tableColumns = ["userId", "statement"];
    this.showResult = false;
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
    this.showPath = "";
    this.sqlcheckerService.getSumUpCorrect(this.taskID, "tables").subscribe(
      (x) => {
        this.leftChartCountRight = x.trueCount;
        this.leftChartCountFalse = x.falseCount;
        this.pieChartDataLeft = [x.trueCount, x.falseCount];
      },
      () => {}
    );
    this.sqlcheckerService.getSumUpCorrect(this.taskID, "attributes").subscribe(
      (x) => {
        this.pieChartDataRight = [x.trueCount, x.falseCount];
      },
      () => {}
    );
  }
  private tableCheckerWrongTables(e: any) {
    e = e.active[0]._index;
    if (e === 0) {
      this.tableCheckerRightTables();
    } else {
      this.resultTableObs = this.sqlcheckerService.getListByType(
        this.taskID,
        "tables"
      );
      this.resultTable = this.resultTableObs;
      this.showPath = "Falsche Tabellen";
      this.showResult = true;
      this.showLeft = false;
      this.showRight = false;
      this.displayedColumnsWrongTable = ["userID", "userQuery"];
    }
  }
  private tableCheckerRightTables() {
    this.showPath = "Korrekte Tabellen";
    this.showRight = false;
    this.showLeft = false;
    this.showCenterTableChecker = true;
    this.showTableCheckerRightTables = true;
    this.pieChartLabelsCenter = [
      ["Korrekte Tabellen korrekte Attribute"],
      ["Korrekte Tabellen falsche Attribute"],
    ];
    this.sqlcheckerService
      .getSumUpCorrectCombined(this.taskID, "tables")
      .subscribe(
        (x) => {
          this.pieChartDataCenter = [x.trueCount, x.falseCount];
        },
        () => {}
      );
  }
  private clickCenterChartTableChecker(e: any) {
    e = e.active[0]._index;
    if (this.showTableCheckerRightTables) {
      if (e === 0) {
        this.showPath = "Korrekte Tabellen ➔ korrekte Attribute";
        this.showResult = true;
        this.showCenterTableChecker = false;
        this.displayedColumnsWrongTable = ["userID", "userQuery"];
        this.resultTableObs = this.sqlcheckerService.getListByTypes(
          this.taskID,
          true,
          true
        );
        this.resultTable = this.resultTableObs;
      }
    }
    if (e === 1) {
      this.showPath = "Korrekte Tabellen ➔ falsche Attribute";
      this.showResult = true;
      this.showCenterTableChecker = false;
      this.displayedColumnsWrongTable = ["userID", "userQuery"];
      this.resultTableObs = this.sqlcheckerService.getListByTypes(
        this.taskID,
        true,
        false
      );
      this.resultTable = this.resultTableObs;
    }
  }
  private clickAttributeChart(e: any) {
    e = e.active[0]._index;
    if (e === 0) {
      this.attributeCheckerRightAttribute();
    } else {
      this.showPath = "Falsche Attribute";
      this.showRight = false;
      this.showLeft = false;
      this.showResult = true;
      this.displayedColumnsWrongTable = ["userID", "userQuery"];
      this.resultTableObs = this.sqlcheckerService.getListByType(
        this.taskID,
        "attributes"
      );
      this.resultTable = this.resultTableObs;
    }
  }
  private attributeCheckerRightAttribute() {
    this.showPath = "Korrekte Attribute";
    this.showRight = false;
    this.showLeft = false;
    this.showCenterAttributeChecker = true;
    this.showAttributeCheckerRightAttribute = true;
    this.pieChartLabelsCenter = [
      ["Korrekte Attribute korrekte Tabellen"],
      ["Korrekte Attribute falsche Tabellen"],
    ];
    this.centerChartSum = this.sqlcheckerService.getSumUpCorrectCombined(
      this.taskID,
      "attributes"
    );
    this.sqlcheckerService
      .getSumUpCorrectCombined(this.taskID, "attributes")
      .subscribe(
        (x) => {
          this.pieChartDataCenter = [x.trueCount, x.falseCount];
        },
        () => {}
      );
  }
  private clickCenterChartAttributeChecker(e: any) {
    e = e.active[0]._index;
    if (e === 0) {
      this.showPath = "Korrekte Attribute ➔ korrekte Tabellen";
      this.showResult = true;
      this.showCenterAttributeChecker = false;
      this.displayedColumnsWrongTable = ["userID", "userQuery"];
      this.resultTableObs = this.sqlcheckerService.getListByTypes(
        this.taskID,
        true,
        true
      );
      this.resultTable = this.resultTableObs;
    }
    if (e === 1) {
      this.showPath = "Korrekte Attribute ➔ falsche Tabellen";
      this.showResult = true;
      this.showCenterAttributeChecker = false;
      this.resultTableObs = this.sqlcheckerService.getListByTypes(
        this.taskID,
        false,
        true
      );
      this.resultTable = this.resultTableObs;
    }
  }
}

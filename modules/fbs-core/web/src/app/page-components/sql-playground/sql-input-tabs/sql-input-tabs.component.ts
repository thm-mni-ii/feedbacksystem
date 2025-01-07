import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
  ElementRef,
  ViewChild,
  HostListener,
  EventEmitter,
  Output,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Store } from "@ngrx/store";
import { Observable, of } from "rxjs";
import { map, take } from "rxjs/operators";
import { AuthService } from "src/app/service/auth.service";
import { CourseRegistrationService } from "src/app/service/course-registration.service";
import { PrismService } from "src/app/service/prism.service";
import { TaskService } from "src/app/service/task.service";
import { Course } from "src/app/model/Course";
import { Task } from "src/app/model/Task";
import { QueryTab } from "src/app/model/sql_playground/QueryTab";
import { ConfirmDialogComponent } from "src/app/dialogs/confirm-dialog/confirm-dialog.component";
import * as SqlInputTabsActions from "./state/sql-input-tabs.actions";
import * as fromSqlInputTabs from "./state/sql-input-tabs.selectors";
import * as fromSqlPlayground from "../state/sql-playground.selectors";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: "app-sql-input-tabs",
  templateUrl: "./sql-input-tabs.component.html",
  styleUrls: ["./sql-input-tabs.component.scss"],
})
export class SqlInputTabsComponent
  implements OnInit, AfterViewChecked, AfterViewInit
{
  @Output() submitStatement = new EventEmitter<string>();
  isPending: boolean;
  activeTabIndex: number;
  tabs: QueryTab[];
  activeTab: QueryTab;

  @HostListener("window:keyup", ["$event"])
  keyEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === "Enter") {
      this.submission();
    }
  }
  @ViewChild("textArea", { static: true }) textArea!: ElementRef;
  @ViewChild("codeContent", { static: true }) codeContent!: ElementRef;
  @ViewChild("pre", { static: true }) pre!: ElementRef;

  highlighted = false;
  codeType = "sql";

  groupForm = new FormGroup({
    content: new FormControl(""),
  });

  get contentControl() {
    return this.groupForm.get("content")?.value;
  }

  isPending$: Observable<boolean>;
  tabs$: Observable<QueryTab[]>;
  activeTab$: Observable<QueryTab>;
  activeTabIndex$: Observable<number>;
  courses: Observable<Course[]> = of();
  allTasksFromCourse: Task[] = [];
  filteredTasksFromCourse: Task[] = [];
  isDescriptionMode: boolean = false;
  isCheckerEmpty: boolean;

  constructor(
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private courseRegistrationService: CourseRegistrationService,
    private taskService: TaskService,
    private prismService: PrismService,
    private store: Store
  ) {}

  ngAfterViewChecked() {
    if (this.highlighted) {
      this.prismService.highlightAll();
      this.highlighted = false;
    }
  }

  ngAfterViewInit() {
    this.prismService.highlightAll();
  }

  ngOnInit(): void {
    const userID = this.authService.getToken().id;
    this.courses = this.courseRegistrationService.getRegisteredCourses(userID);

    this.isPending$ = this.store.select(fromSqlPlayground.selectIsQueryPending);
    this.tabs$ = this.store.select(fromSqlInputTabs.selectTabs);
    this.activeTab$ = this.store.select(fromSqlInputTabs.selectActiveTab);
    this.activeTabIndex$ = this.store.select(
      fromSqlInputTabs.selectActiveTabIndex
    );

    this.store.dispatch(SqlInputTabsActions.loadTabsFromLocalStorage());

    this.isPending$.subscribe((isPending) => (this.isPending = isPending));
    this.activeTabIndex$.subscribe((index) => (this.activeTabIndex = index));
    this.tabs$.subscribe((tabs) => {
      this.tabs = tabs;
    });
    this.activeTab$.subscribe((activeTab) => (this.activeTab = activeTab));
  }

  closeTab(index: number) {
    this.openConfirmDialog(
      "Möchtest du wirklich diesen Tab schließen?",
      "Achtung der Inhalt wird nicht gespeichert!"
    ).subscribe((result) => {
      if (result) {
        this.store.dispatch(SqlInputTabsActions.closeTab({ index }));
      }
    });
  }

  saveToLocalStorage() {
    this.store.dispatch(SqlInputTabsActions.saveTabsToLocalStorage());
  }

  addTab(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.store.dispatch(SqlInputTabsActions.addTab({}));
  }

  closeAllTabs(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.openConfirmDialog(
      "Möchtest du wirklich alle Tabs schließen?",
      "Achtung der Inhalt wird nicht gespeichert!"
    ).subscribe((result) => {
      if (result) {
        this.store.dispatch(SqlInputTabsActions.closeAllTabs());
      }
    });
  }

  openConfirmDialog(title: string, message: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: title,
        message: message,
      },
    });
    return dialogRef.afterClosed();
  }

  downloadFile(index: number) {
    this.store.dispatch(SqlInputTabsActions.downloadFile({ index }));
  }

  downloadAllFiles() {
    this.openConfirmDialog(
      "Möchtest du wirklich alle Dateien herunterladen?",
      ""
    ).subscribe((result) => {
      if (result) {
        this.store.dispatch(SqlInputTabsActions.downloadAllFiles());
      }
    });
  }

  isSubmissionEmpty(): Observable<boolean> {
    return this.activeTab$.pipe(
      map(
        (activeTab) => !activeTab || activeTab.content === "" || this.isPending
      )
    );
  }

  submission(): void {
    this.isSubmissionEmpty()
      .pipe(take(1))
      .subscribe((isEmpty) => {
        if (isEmpty) {
          this.snackbar.open("Sie haben keine Lösung abgegeben", "Ups!");
        } else {
          this.activeTabIndex$.pipe(take(1)).subscribe((index) => {
            this.store.dispatch(SqlInputTabsActions.submission({ index }));
          });
        }
      });
  }

  updateMode(index: number, value: boolean) {
    this.store.dispatch(SqlInputTabsActions.updateMode({ index, value }));
  }

  hasDeadlinePassed(task: Task): boolean {
    if (!task) {
      return true;
    }
    return Date.now() > Date.parse(task.deadline);
  }

  changeCourse(index: number, course: Course) {
    this.store.dispatch(SqlInputTabsActions.changeCourse({ index, course }));
  }

  changeTask(index: number, task: Task) {
    this.store.dispatch(SqlInputTabsActions.changeTask({ index, task }));
  }

  getTasks(courseId: number) {
    this.taskService.getAllTasks(courseId).subscribe(
      (allTasks) => {
        this.allTasksFromCourse = allTasks;
        this.filterTasks();
      },
      () => {}
    );
  }

  private filterTasks() {
    this.filteredTasksFromCourse = this.allTasksFromCourse.filter(
      (task) => task.mediaType === "text/plain" && !this.hasDeadlinePassed(task)
    );

    if (this.filteredTasksFromCourse.length < 1) {
      this.snackbar.open("Dieser Kurs hat keine SQL Aufgaben!", "OK", {
        duration: 3000,
      });
    }
  }

  setActiveTab(index: number) {
    this.store.dispatch(SqlInputTabsActions.setActiveTab({ index }));
  }

  updateTabContent(index: number, content: string) {
    console.log("utca");
    this.store.dispatch(
      SqlInputTabsActions.updateTabContent({ index, content })
    );
  }

  submissionToTask() {
    // Implement the method logic
  }

  trackByIndex(index: number, obj: any): any {
    return obj.id;
  }

  updateTabName(index: number, name: string) {
    this.store.dispatch(SqlInputTabsActions.updateTabName({ index, name }));
  }
}

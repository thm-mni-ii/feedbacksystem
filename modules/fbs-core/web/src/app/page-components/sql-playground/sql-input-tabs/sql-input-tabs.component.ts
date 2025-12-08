import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  OnDestroy,
  Output,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Store } from "@ngrx/store";
import { Observable, of, Subject, Subscription } from "rxjs";
import { map, take } from "rxjs/operators";
import { AuthService } from "src/app/service/auth.service";
import { CourseRegistrationService } from "src/app/service/course-registration.service";
import { PrismService } from "src/app/service/prism.service";
import { TaskService } from "src/app/service/task.service";
import { Course } from "src/app/model/Course";
import { Task } from "src/app/model/Task";
import { QueryTab } from "src/app/model/sql_playground/QueryTab";
import { CheckerConfig } from "src/app/model/CheckerConfig";
import { ConfirmDialogComponent } from "src/app/dialogs/confirm-dialog/confirm-dialog.component";
import * as SqlInputTabsActions from "./state/sql-input-tabs.actions";
import * as fromSqlInputTabs from "./state/sql-input-tabs.selectors";
import * as fromSqlPlayground from "../state/sql-playground.selectors";
import { FormControl, FormGroup } from "@angular/forms";
import { SubmissionService } from "../../../service/submission.service";
import { Input } from "@angular/core";
import { MongoPlaygroundService } from "../../../service/mongo-playground.service";
import { CheckerService } from "src/app/service/checker.service";

@Component({
  selector: "app-sql-input-tabs",
  templateUrl: "./sql-input-tabs.component.html",
  styleUrls: ["./sql-input-tabs.component.scss"],
})
export class SqlInputTabsComponent
  implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy
{
  @Input() dbType: "postgres" | "mongo" = "postgres";
  @Input() dbName!: string;
  @Input() schemaReload!: Subject<void>;
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
  codeType: "sql" | "json" = "sql";
  isDescriptionMode: boolean = true;

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
  isCheckerEmpty: boolean;
  checkerConfigCache: Map<number, CheckerConfig[]> = new Map();
  private subs: Subscription[] = [];
  private lastCourseId?: number;

  constructor(
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private courseRegistrationService: CourseRegistrationService,
    private taskService: TaskService,
    private submissionService: SubmissionService,
    private prismService: PrismService,
    private store: Store,
    private mongoService: MongoPlaygroundService,
    private checkerService: CheckerService
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
    this.codeType = this.dbType === "mongo" ? "json" : "sql";
    const userID = this.authService.getToken().id;
    this.courses = this.courseRegistrationService.getRegisteredCourses(userID);

    this.isPending$ = this.store.select(fromSqlInputTabs.selectPending);
    this.tabs$ = this.store.select(fromSqlInputTabs.selectTabs);
    this.activeTab$ = this.store.select(fromSqlInputTabs.selectActiveTab);
    this.activeTabIndex$ = this.store.select(
      fromSqlInputTabs.selectActiveTabIndex
    );

    this.store.dispatch(SqlInputTabsActions.loadTabsFromLocalStorage());

    this.subs.push(
      this.isPending$.subscribe((isPending) => (this.isPending = isPending))
    );
    this.subs.push(
      this.activeTabIndex$.subscribe((index) => (this.activeTabIndex = index))
    );
    this.subs.push(this.tabs$.subscribe((tabs) => (this.tabs = tabs)));
    this.subs.push(
      this.activeTab$.subscribe((activeTab) =>
        this.onActiveTabChange(activeTab)
      )
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s?.unsubscribe?.());
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
          this.snackbar.open("Sie haben keine Lösung abgegeben", "Fehler");
        } else {
          this.activeTabIndex$.pipe(take(1)).subscribe((index) => {
            const query = this.tabs[index].content;

            this.submitStatement.emit(query);
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
    this.getTasks(course.id);
  }

  changeTask(index: number, task: Task) {
    this.store.dispatch(SqlInputTabsActions.changeTask({ index, task }));
    const courseId = this.tabs[index]?.selectedCourse?.id;
    if (courseId) {
      this.fetchCheckerConfigs(courseId, task.id);
    }
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
    this.store.dispatch(
      SqlInputTabsActions.updateTabContent({ index, content })
    );
  }

  submissionToTask() {
    this.store.dispatch(
      SqlInputTabsActions.submissionToTask({ index: this.activeTabIndex })
    );
  }

  trackByIndex(index: number, obj: any): any {
    return obj.id;
  }

  updateTabName(index: number, name: string) {
    this.store.dispatch(SqlInputTabsActions.updateTabName({ index, name }));
  }

  private fetchCheckerConfigs(courseId: number, taskId: number) {
    this.checkerConfigCache.delete(taskId);
    this.checkerService.getChecker(courseId, taskId).subscribe((configs) =>
      this.checkerConfigCache.set(
        taskId,
        configs.sort((a, b) => a.ord - b.ord)
      )
    );
  }

  private onActiveTabChange(activeTab: QueryTab) {
    this.activeTab = activeTab;
    const courseId = activeTab?.selectedCourse?.id;
    const taskId = activeTab?.selectedTask?.id;

    if (courseId && this.lastCourseId !== courseId) {
      this.getTasks(courseId);
      this.lastCourseId = courseId;
    }

    if (courseId && taskId && !this.checkerConfigCache.has(taskId)) {
      this.fetchCheckerConfigs(courseId, taskId);
    }

    if (courseId && taskId) {
      this.fetchLatestSubmission(activeTab);
    }
  }

  private getCheckerConfigs(taskId?: number): CheckerConfig[] {
    if (!taskId) {
      return [];
    }
    return this.checkerConfigCache.get(taskId) || [];
  }

  private getStagedLimit(tab: QueryTab): number {
    return tab.selectedTask?.stagedFeedbackLimit ?? 1;
  }

  private isStagedEnabled(tab: QueryTab): boolean {
    return !!tab.selectedTask?.stagedFeedbackEnabled;
  }

  private getCheckerIdByOrder(tab: QueryTab, ord: number): number | undefined {
    return this.getCheckerConfigs(tab.selectedTask?.id).find(
      (c) => c.ord === ord
    )?.id;
  }

  get showStatusRow(): boolean {
    return (
      !!this.activeTab?.selectedTask &&
      (!!this.activeTab?.lastResults?.length || this.isPending)
    );
  }

  submissionHasFailure(tab: QueryTab = this.activeTab): boolean {
    return !!tab?.lastResults?.some((r: any) => r.exitCode !== 0);
  }

  submissionAllSuccess(tab: QueryTab = this.activeTab): boolean {
    return !!tab?.lastResults?.length && !this.submissionHasFailure(tab);
  }

  get errorMessages(): string[] {
    const results = this.activeTab?.lastResults || [];
    return results
      .filter((r: any) => r.exitCode !== 0 && r.resultText)
      .map((r: any) => r.resultText);
  }

  private hasResultForOrder(tab: QueryTab, ord: number): boolean {
    const configId = this.getCheckerIdByOrder(tab, ord);
    if (!configId || !tab.lastResults) {
      return false;
    }
    return tab.lastResults.some((res: any) => res.configurationId === configId);
  }

  private getMissingDetailedOrders(tab: QueryTab): number[] {
    if (!this.isStagedEnabled(tab)) {
      return [];
    }
    const limit = this.getStagedLimit(tab);
    return this.getCheckerConfigs(tab.selectedTask?.id)
      .filter((c) => c.ord > limit)
      .map((c) => c.ord)
      .filter((ord) => !this.hasResultForOrder(tab, ord));
  }

  private hasFailingQuickCheck(tab: QueryTab): boolean {
    if (!this.isStagedEnabled(tab) || !tab.lastResults) {
      return false;
    }
    const limit = this.getStagedLimit(tab);
    return this.getCheckerConfigs(tab.selectedTask?.id)
      .filter((c) => c.ord <= limit)
      .some((c) => {
        const cid = this.getCheckerIdByOrder(tab, c.ord);
        const res = tab.lastResults?.find(
          (r: any) => r.configurationId === cid
        );
        return res && res.exitCode !== 0;
      });
  }

  showDetailedFeedbackBox(tab: QueryTab): boolean {
    return (
      this.isStagedEnabled(tab) &&
      !this.isPending &&
      !tab.detailedPending &&
      tab.isSubmitted &&
      this.hasFailingQuickCheck(tab) &&
      this.getMissingDetailedOrders(tab).length > 0
    );
  }

  requestDetailedFeedback() {
    const tab = this.activeTab;
    if (
      !tab ||
      !tab.lastSubmissionId ||
      !this.isStagedEnabled(tab) ||
      this.isPending
    ) {
      return;
    }
    const missingOrders = this.getMissingDetailedOrders(tab);
    if (missingOrders.length === 0) {
      return;
    }
    this.store.dispatch(SqlInputTabsActions.setPending({ pending: true }));
    this.store.dispatch(
      SqlInputTabsActions.setDetailedPending({ pending: true })
    );
    const token = this.authService.getToken();
    this.submissionService
      .restartSubmission(
        token.id,
        tab.selectedCourse.id,
        tab.selectedTask.id,
        tab.lastSubmissionId,
        missingOrders
      )
      .subscribe(
        () => {
          this.store.dispatch(
            SqlInputTabsActions.waitForSubDone({
              index: this.activeTabIndex,
              sid: tab.lastSubmissionId,
            })
          );
        },
        (error) => {
          console.error(error);
          this.store.dispatch(
            SqlInputTabsActions.setPending({ pending: false })
          );
          this.store.dispatch(
            SqlInputTabsActions.setDetailedPending({ pending: false })
          );
          this.snackbar.open(
            "Das ausführliche Feedback konnte nicht gestartet werden.",
            "OK",
            { duration: 3000 }
          );
        }
      );
  }

  private fetchLatestSubmission(tab: QueryTab, forceRefresh = false) {
    const courseId = tab?.selectedCourse?.id;
    const taskId = tab?.selectedTask?.id;
    if (!courseId || !taskId) {
      return;
    }
    // Wenn bereits eine Submission im Tab ist und wir nicht forcieren, nicht neu laden
    // Dies verhindert unnötige API-Calls nach waitForSubDone
    if (!forceRefresh && tab.lastSubmissionId && tab.lastResults?.length) {
      return;
    }
    const token = this.authService.getToken();
    this.submissionService
      .getAllSubmissions(token.id, courseId, taskId)
      .pipe(take(1))
      .subscribe(
        (subs) => {
          if (!subs || subs.length === 0) {
            return;
          }
          // Sortiere nach submissionTime (neueste zuerst) und dann nach ID (höchste zuerst als Fallback)
          const sortedSubs = [...subs].sort((a, b) => {
            const timeA = a.submissionTime || 0;
            const timeB = b.submissionTime || 0;
            if (timeB !== timeA) {
              return timeB - timeA; // Neueste zuerst
            }
            return (b.id || 0) - (a.id || 0); // Bei gleicher Zeit: höchste ID zuerst
          });
          const latest = sortedSubs[0];
          console.log(
            "fetchLatestSubmission - Alle Submissions:",
            subs.map((s) => ({ id: s.id, time: s.submissionTime }))
          );
          console.log(
            "fetchLatestSubmission - Neueste Submission ID:",
            latest.id
          );
          const results = latest.results || [];
          // everCorrect: Hat IRGENDEINE Submission jemals ALLE Checks bestanden?
          const hasSuccess = subs.some((s: any) => {
            const subResults = s.results || [];
            return (
              subResults.length > 0 &&
              subResults.every((r: any) => r.exitCode === 0)
            );
          });
          const latestHasFailure = results.some((r: any) => r.exitCode !== 0);
          const latestSuccess =
            results.length > 0 &&
            !latestHasFailure &&
            results.every((r: any) => r.exitCode === 0);
          const latestFailureMsg =
            results.find((r: any) => r.exitCode !== 0)?.resultText || null;
          this.store.dispatch(
            SqlInputTabsActions.setSubmissionData({
              submissionId: latest.id,
              results,
            })
          );
          this.store.dispatch(
            SqlInputTabsActions.setSubmissionResult({
              isCorrect: latestSuccess,
              error: latestHasFailure,
              errorMsg: latestFailureMsg,
              everCorrect: hasSuccess,
            })
          );
        },
        () => {}
      );
  }
}

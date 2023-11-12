import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "src/app/dialogs/confirm-dialog/confirm-dialog.component";
import { FormControl, FormGroup, UntypedFormControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/service/auth.service";
import { Observable, of } from "rxjs";
import { Course } from "src/app/model/Course";
import { CourseRegistrationService } from "../../../service/course-registration.service";
import { repeat, takeWhile } from "rxjs/operators";
import { TaskService } from "src/app/service/task.service";
import { Task } from "src/app/model/Task";
import { SubmissionService } from "../../../service/submission.service";
import { PrismService } from "src/app/service/prism.service";
import { Subscription } from "rxjs";
import { CheckerService } from "src/app/service/checker.service";
import { QueryTab } from "src/app/model/sql_playground/QueryTab";
import { I18NextPipe } from "angular-i18next";

@Component({
  selector: "app-sql-input-tabs",
  templateUrl: "./sql-input-tabs.component.html",
  styleUrls: ["./sql-input-tabs.component.scss"],
})
export class SqlInputTabsComponent
  implements OnInit, AfterViewChecked, AfterViewInit
{
  @Input() isPending: boolean;
  @Output() submitStatement = new EventEmitter<string>();
  @HostListener("window:keyup", ["$event"])
  keyEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === "Enter") {
      // Your row selection code
      this.submission();
    }
  }
  @ViewChild("textArea", { static: true })
  textArea!: ElementRef;
  @ViewChild("codeContent", { static: true })
  codeContent!: ElementRef;
  @ViewChild("pre", { static: true })
  pre!: ElementRef;

  sub!: Subscription;
  highlighted = false;
  codeType = "sql";

  groupForm = new FormGroup({
    content: new FormControl(""),
  });

  get contentControl() {
    return this.groupForm.get("content")?.value;
  }

  constructor(
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private courseRegistrationService: CourseRegistrationService,
    private submissionService: SubmissionService,
    private taskService: TaskService,
    private prismService: PrismService,
    private renderer: Renderer2,
    private checkerService: CheckerService,
    private i18nextPipe: I18NextPipe
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

  tabs: QueryTab[] = [];
  activeTabId = new UntypedFormControl(0);
  activeTab: QueryTab;
  pending: boolean = false;
  courses: Observable<Course[]> = of();
  control: UntypedFormControl = new UntypedFormControl();
  allTasksFromCourse: Task[];
  filteredTasksFromCourse: Task[] = [];
  isDescriptionMode: boolean = false;
  isCheckerEmpty: boolean;

  ngOnInit(): void {
    const userID = this.authService.getToken().id;
    this.courses = this.courseRegistrationService.getRegisteredCourses(userID);
    this.activeTabId.valueChanges.subscribe((value) => {
      this.activeTab = this.tabs[value];
    });
    this.loadFromLocalStorage();
  }

  closeTab(index: number) {
    this.openConfirmDialog(
      "Möchtest du wirklich diesen " + this.tabs[index].name + "  schließen?",
      "Achtung der Inhalt wird nicht gespeichert!"
    ).subscribe((result) => {
      if (result == true) {
        this.deleteFromLocalStorage(index);
        this.tabs.splice(index, 1);
        this.activeTabId.setValue(this.tabs.length - 1);
        this.loadFromLocalStorage();
      }
    });
  }

  saveToLocalStorage() {
    const data = { tabs: this.tabs };
    localStorage.setItem("tabs", JSON.stringify(data));
  }

  loadFromLocalStorage() {
    const loadedData = localStorage.getItem("tabs");

    if (loadedData && JSON.parse(loadedData).tabs.length > 0) {
      this.tabs = JSON.parse(loadedData).tabs;
      this.activeTab = this.tabs[this.activeTabId.value];
    } else {
      this.addTab();
    }
  }

  deleteFromLocalStorage(index: number) {
    const data = JSON.parse(localStorage.getItem("tabs"));
    data.tabs.splice(index, 1);
    localStorage.setItem("tabs", JSON.stringify(data));
  }

  updateSubmissionContent(data: String) {
    let submissionContent = data["content"];
    this.tabs[this.activeTabId.value].content = submissionContent;
    this.saveToLocalStorage();
  }

  addTab(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.tabs.push({
      name: this.i18nextPipe.transform("sql-playground.input.new-query"),
      content: "",
      error: false,
      errorMsg: null,
      isCorrect: false,
      isSubmitted: false,
      isSubmitMode: false,
      selectedCourse: undefined,
      selectedTask: undefined,
      selectedCourseName: this.i18nextPipe.transform(
        "sql-playground.input.course"
      ),
      selectedTaskName: this.i18nextPipe.transform("sql-playground.input.task"),
    });
    this.activeTabId.setValue(this.tabs.length - 1);
    this.saveToLocalStorage();
  }

  closeAllTabs(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.openConfirmDialog(
      "Möchtest du wirklich alle Tabs schließen?",
      "Achtung der Inhalt wird nicht gespeichert!"
    ).subscribe((result) => {
      if (result == true) {
        this.tabs = [];
        this.addTab();
        this.saveToLocalStorage();
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

  downloadFile() {
    var file = new Blob([this.activeTab.content], { type: ".txt" });
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = this.activeTab.name + ".sql";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  downloadAllFiles() {
    this.openConfirmDialog(
      "Möchtest du wirklich alle Dateien herunterladen?",
      ""
    ).subscribe((result) => {
      if (result == true) {
        for (let i = 0; i < this.tabs.length; i++) {
          var file = new Blob([this.tabs[i].content], { type: ".txt" });
          var a = document.createElement("a"),
            url = URL.createObjectURL(file);
          a.href = url;
          a.download = this.tabs[i].name + ".sql";
          document.body.appendChild(a);
          a.click();
          setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 200);
        }
      }
    });
  }

  isSubmissionEmpty(): boolean {
    if (
      this.activeTab != undefined &&
      this.activeTab.content != "" &&
      this.pending == false
    ) {
      return false;
    }
    return true;
  }

  submission(): void {
    if (this.isSubmissionEmpty()) {
      this.snackbar.open("Sie haben keine Lösung abgegeben", "Ups!");
      return;
    }
    this.submitStatement.emit(this.activeTab.content);
  }

  updateMode(value: boolean) {
    this.activeTab.isSubmitMode = value;
    this.pending = false;
  }

  hasDeadlinePassed(task: Task = this.activeTab.selectedTask): boolean {
    if (task == null) {
      return true;
    }
    return Date.now() > Date.parse(task.deadline);
  }

  emptyTask() {
    this.activeTab.selectedTask = null;
    this.filteredTasksFromCourse = [];
    this.activeTab.selectedTaskName = "Aufgabe";
  }

  changeCourse(course: Course) {
    this.activeTab.selectedCourse = course;
    this.activeTab.selectedCourseName = this.activeTab.selectedCourse.name;
    this.activeTab.error = false;
    this.activeTab.isSubmitted = false;
    this.getTasks();
    this.emptyTask();
    this.saveToLocalStorage();
  }

  changeTask(task: Task) {
    this.activeTab.selectedTask = task;
    this.activeTab.selectedTaskName = this.activeTab.selectedTask.name;
    this.activeTab.error = false;
    this.activeTab.isSubmitted = false;
    this.checkerService
      .checkForCheckerConfig(
        this.activeTab.selectedCourse.id,
        this.activeTab.selectedTask.id
      )
      .subscribe((res) => (this.isCheckerEmpty = res));
    this.saveToLocalStorage();
  }

  getTasks() {
    this.taskService.getAllTasks(this.activeTab.selectedCourse.id).subscribe(
      (allTasks) => {
        this.allTasksFromCourse = allTasks;
        this.filterTasks();
      },
      () => {}
    );
  }

  private filterTasks() {
    for (let task of this.allTasksFromCourse) {
      if (task.mediaType == "text/plain" && !this.hasDeadlinePassed(task)) {
        this.filteredTasksFromCourse.push(task);
      }
    }
    if (this.filteredTasksFromCourse.length < 1) {
      this.snackbar.open("Dieser Kurs hat keine SQL Aufgaben!", "OK", {
        duration: 3000,
      });
    }
  }

  wasSubmissionCorrect(subResult: number) {
    if (subResult != 0) {
      this.activeTab.isCorrect = false;
      this.activeTab.error = true;
    } else {
      this.activeTab.isCorrect = true;
      this.activeTab.error = false;
    }
  }

  waitForSubDone(sid: number) {
    const token = this.authService.getToken();
    this.submissionService
      .getSubmission(
        token.id,
        this.activeTab.selectedCourse.id,
        this.activeTab.selectedTask.id,
        sid
      )
      .pipe(
        repeat(),
        takeWhile((sub) => !sub.done, true)
      )
      .subscribe(
        (res) => {
          if (res.done) {
            if (res.results[0].exitCode == 0) {
              this.activeTab.errorMsg = null;
              this.wasSubmissionCorrect(res.results[0].exitCode);
              this.pending = false;
              this.activeTab.isSubmitted = true;
            } else {
              this.wasSubmissionCorrect(res.results[0].exitCode);
              this.activeTab.errorMsg = res.results[0].resultText;
              this.pending = false;
              this.activeTab.isSubmitted = true;
            }
          }
        },
        () => {}, //handle error
        () => console.log("Submission Request Complete")
      );
  }

  private submitToTask() {
    this.pending = true;
    const token = this.authService.getToken();
    this.submissionService
      .submitSolution(
        token.id,
        this.activeTab.selectedCourse.id,
        this.activeTab.selectedTask.id,
        this.cleanUpTextAreaRegx(this.activeTab.content)
      )
      .subscribe(
        (subResult) => {
          this.snackbar.open("Deine Abgabe wird ausgewertet.", "OK", {
            duration: 3000,
          });
          this.waitForSubDone(subResult.id);
        },
        (error) => {
          console.error(error);
          this.snackbar.open(
            "Beim Versenden ist ein Fehler aufgetreten. Versuche es später erneut.",
            "OK",
            { duration: 3000 }
          );
          this.pending = false;
        },
        () => {
          console.log("Request Complete");
        }
      );
  }

  submissionToTask(): void {
    if (this.isSubmissionEmpty()) {
      this.snackbar.open("Sie haben keine Lösung abgegeben", "Ups!");
      return;
    }
    this.submitToTask();
    this.saveToLocalStorage();
  }

  cleanUpTextAreaRegx(sqlInput: String) {
    let temp = sqlInput.trim().replace(/\s+/g, " ");
    return temp;
  }
}

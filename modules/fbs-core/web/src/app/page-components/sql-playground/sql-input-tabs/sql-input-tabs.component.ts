import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
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

@Component({
  selector: "app-sql-input-tabs",
  templateUrl: "./sql-input-tabs.component.html",
  styleUrls: ["./sql-input-tabs.component.scss"],
})
export class SqlInputTabsComponent
  implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy
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
  ngOnDestroy(): void {
    throw new Error("Method not implemented.");
  }

  fileName = "New_Query";
  tabs = [{ name: this.fileName, content: "" }];
  activeTabId = new UntypedFormControl(0);
  activeTab = this.tabs[this.activeTabId.value];
  pending: boolean = false;
  courses: Observable<Course[]> = of();
  control: UntypedFormControl = new UntypedFormControl();
  isSubmitMode = false;
  selectedCourseName: String = "Kurs";
  selectedTaskName: String = "Aufgabe";
  selectedCourse: Course;
  selectedTask: Task;
  allTasksFromCourse: Task[];
  filteredTasksFromCourse: Task[] = [];
  isDescriptionMode: boolean = false;
  isSubCorr = false;
  submitted = false;
  isCheckerEmpty: boolean;

  ngOnInit(): void {
    const userID = this.authService.getToken().id;
    this.courses = this.courseRegistrationService.getRegisteredCourses(userID);
    this.activeTabId.valueChanges.subscribe((value) => {
      this.activeTab = this.tabs[value];
    });
  }

  closeTab(index: number) {
    this.openConfirmDialog(
      "Möchtest du wirklich diesen " + this.tabs[index].name + "  schließen?",
      "Achtung der Inhalt wird nicht gespeichert!"
    ).subscribe((result) => {
      if (result == true) {
        this.tabs.splice(index, 1);
      }
    });
  }

  updateSubmissionContent(data: String) {
    let submissionContent = data["content"];
    this.tabs[this.activeTabId.value].content = submissionContent;
  }

  addTab(event: MouseEvent) {
    event.stopPropagation();
    this.tabs.push({ name: this.fileName, content: "" });
    this.activeTabId.setValue(this.tabs.length - 1);
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

  isSubmissionEmpty(): boolean {
    if (this.activeTab.content != "" && this.pending == false) {
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
    this.isSubmitMode = value;
  }

  hasDeadlinePassed(task: Task = this.selectedTask): boolean {
    if (task == null) {
      return true;
    }
    return Date.now() > Date.parse(task.deadline);
  }

  emptyTask() {
    this.selectedTask = null;
    this.filteredTasksFromCourse = [];
    this.selectedTaskName = "Aufgabe";
  }

  changeCourse(course: Course) {
    this.selectedCourse = course;
    this.selectedCourseName = this.selectedCourse.name;
    //this.tasks = this.taskService.getAllTasks(this.selectedCourse.id);
    this.getTasks();
    this.emptyTask();
  }

  changeTask(task: Task) {
    this.selectedTask = task;
    this.selectedTaskName = this.selectedTask.name;
    this.submitted = false;
    this.checkForCheckerConfig();
  }

  getTasks() {
    this.taskService.getAllTasks(this.selectedCourse.id).subscribe(
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
      this.isSubCorr = false;
    } else {
      this.isSubCorr = true;
    }
  }

  waitForSubDone(sid: number) {
    const token = this.authService.getToken();
    this.submissionService
      .getSubmission(
        token.id,
        this.selectedCourse.id,
        this.selectedTask.id,
        sid
      )
      .pipe(
        repeat(),
        takeWhile((sub) => !sub.done, true)
      )
      .subscribe(
        (res) => {
          if (res.done) {
            this.wasSubmissionCorrect(res.results[0].exitCode);
            this.pending = false;
          }
        },
        () => {}, //handle error
        () => console.log("Submission Request Complete")
      );
  }

  private submitToTask() {
    this.submitted = true;
    this.pending = true;
    const token = this.authService.getToken();
    this.submissionService
      .submitSolution(
        token.id,
        this.selectedCourse.id,
        this.selectedTask.id,
        this.activeTab.content
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
    //this.submissionService.emitFileSubmission();
  }

  private checkForCheckerConfig() {
    this.checkerService
      .getChecker(this.selectedCourse.id, this.selectedTask.id)
      .subscribe((checkers) => {
        if (checkers.length === 0) {
          this.isCheckerEmpty = true;
        } else {
          this.isCheckerEmpty = false;
        }
      });
  }
}

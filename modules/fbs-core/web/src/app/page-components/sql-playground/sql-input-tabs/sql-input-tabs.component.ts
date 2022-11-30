import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { delay, retryWhen } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "src/app/dialogs/confirm-dialog/confirm-dialog.component";
import { UntypedFormControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/service/auth.service";
import { SqlPlaygroundService } from "src/app/service/sql-playground.service";
import { Observable, of } from "rxjs";
import { Course } from "src/app/model/Course";
import { CourseRegistrationService } from "../../../service/course-registration.service";
import { mergeMap, startWith } from "rxjs/operators";

@Component({
  selector: "app-sql-input-tabs",
  templateUrl: "./sql-input-tabs.component.html",
  styleUrls: ["./sql-input-tabs.component.scss"],
})
export class SqlInputTabsComponent implements OnInit {
  @Input() activeDb: number;
  @Output() resultset = new EventEmitter<any>();
  @Output() isPending = new EventEmitter<any>();

  constructor(
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private sqlPlaygroundService: SqlPlaygroundService,
    private courseRegistrationService: CourseRegistrationService
  ) {}

  fileName = "New_Query";
  tabs = [{ name: this.fileName, content: "" }];
  activeTabId = new UntypedFormControl(0);
  activeTab = this.tabs[this.activeTabId.value];
  pending: boolean = false;
  submitModeActive: boolean = false;
  courses: Observable<Course[]> = of();
  filteredCourses: Observable<Course[]> = of();
  control: UntypedFormControl = new UntypedFormControl();
  selectedCourseName: String = "Kurs";

  ngOnInit(): void {
    const userID = this.authService.getToken().id;
    this.courses = this.courseRegistrationService.getRegisteredCourses(userID);
    this.filteredCourses = this.control.valueChanges.pipe(
      startWith(""),
      mergeMap((value) => this._filter(value))
    );
    this.activeTabId.valueChanges.subscribe((value) => {
      this.activeTab = this.tabs[value];
    });
  }

  updateMode(value: boolean) {
    this.submitModeActive = value;
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

  addTab() {
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
    this.submit();
    //this.submissionService.emitFileSubmission();
  }

  private submit() {
    this.pending = true;
    this.isPending.emit(true);
    const token = this.authService.getToken();

    this.sqlPlaygroundService
      .submitStatement(token.id, this.activeDb, this.activeTab.content)
      .subscribe(
        (result) => {
          this.getResultsbyPolling(result.id);
        },
        (error) => {
          console.error(error);
          this.snackbar.open(
            "Beim Versenden ist ein Fehler aufgetreten. Versuche es später erneut.",
            "OK",
            { duration: 3000 }
          );
          this.pending = false;
          this.isPending.emit(false);
        }
      );
  }

  getResultsbyPolling(rId: number) {
    const token = this.authService.getToken();

    // this.sqlPlaygroundService
    //   .getResults(token.id, this.activeDb, rId)
    //   .pipe(delay(2500), retry())
    //   .subscribe((res) => {
    //     if (res !== undefined) {
    //       this.resultset.emit(res);
    //     }
    //   });

    this.sqlPlaygroundService
      .getResults(token.id, this.activeDb, rId)
      .pipe(
        retryWhen((err) => {
          return err.pipe(delay(1000));
        })
      )
      .subscribe(
        (res) => {
          // emit if success
          this.pending = false;
          this.isPending.emit(false);
          this.resultset.emit(res);
        },
        () => {}, //handle error
        () => console.log("Request Complete")
      );
  }

  getResultsList() {
    const token = this.authService.getToken();

    this.sqlPlaygroundService.getResultsList(token.id, this.activeDb).subscribe(
      (result) => {
        console.log(result);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  private _filter(value: string): Observable<Course[]> {
    const filterValue = this._normalizeValue(value);
    return this.courses.pipe(
      mergeMap((courseList) => {
        if (filterValue.length > 0) {
          return of(
            courseList.filter((course) =>
              this._normalizeValue(course.name).includes(filterValue)
            )
          );
        } else {
          return this.courses;
        }
      })
    );
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, "");
  }

  changeValue(name: string) {
    this.selectedCourseName = name;
  } 
}

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { interval } from "rxjs";
import { switchMap, takeWhile, retry, delay } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "src/app/dialogs/confirm-dialog/confirm-dialog.component";
import { UntypedFormControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/service/auth.service";
import { SqlPlaygroundService } from "src/app/service/sql-playground.service";
import { outputAst } from "@angular/compiler";

@Component({
  selector: "app-sql-input-tabs",
  templateUrl: "./sql-input-tabs.component.html",
  styleUrls: ["./sql-input-tabs.component.scss"],
})
export class SqlInputTabsComponent implements OnInit {
  @Input() activeDb: number;
  @Output() resultset = new EventEmitter<any>();

  constructor(
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private sqlPlaygroundService: SqlPlaygroundService
  ) {}

  fileName = "New_Query";
  tabs = [{ name: this.fileName, content: "" }];
  activeTabId = new UntypedFormControl(0);
  activeTab = this.tabs[this.activeTabId.value];
  pending: boolean = false;

  ngOnInit(): void {
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
    if (this.activeTab.content != "") {
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
    const token = this.authService.getToken();

    this.sqlPlaygroundService
      .submitStatement(token.id, this.activeDb, this.activeTab.content)
      .subscribe(
        (result) => {
          this.getResultsbyPolling(result.id);
          console.log(result);
          this.snackbar.open("Deine Eingabe wird ausgewertet.", "OK", {
            duration: 3000,
          });
        },
        (error) => {
          console.error(error);
          this.snackbar.open(
            "Beim Versenden ist ein Fehler aufgetreten. Versuche es später erneut.",
            "OK",
            { duration: 3000 }
          );
        }
      );
  }

  getResultsbyPolling(rId: number) {
    const token = this.authService.getToken();
    let result: any;

    this.sqlPlaygroundService
      .getResults(token.id, this.activeDb, rId)
      .pipe(delay(5000), retry())
      .subscribe((res) => {
        result = res;

        if (res !== undefined) {
          this.resultset.emit(res);
        }
      });

    // interval(5000)
    //   .pipe(
    //     switchMap(() =>
    //       this.sqlPlaygroundService.getResults(token.id, this.activeDb, rId)
    //     ),
    //     takeWhile(({}) => {
    //       return result === undefined;
    //     })
    //   )
    //   .subscribe((res) => {
    //     result = res;
    //     console.log(result);

    //     if (res !== undefined) {
    //       this.resultset.emit(res);
    //     }
    //   });
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
}

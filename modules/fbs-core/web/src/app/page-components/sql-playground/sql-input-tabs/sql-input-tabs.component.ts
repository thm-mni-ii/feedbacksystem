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
import { delay, retryWhen } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "src/app/dialogs/confirm-dialog/confirm-dialog.component";
import { FormControl, FormGroup, UntypedFormControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/service/auth.service";
import { SqlPlaygroundService } from "src/app/service/sql-playground.service";
import { SQLResponse } from "src/app/model/sql_playground/SQLResponse";
import { PrismService } from "src/app/service/prism.service";
import { FormBuilder } from "@angular/forms";
import { fromEvent, Subscription } from "rxjs";

@Component({
  selector: "app-sql-input-tabs",
  templateUrl: "./sql-input-tabs.component.html",
  styleUrls: ["./sql-input-tabs.component.scss"],
})
export class SqlInputTabsComponent
  implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy
{
  @Input() activeDb: number;
  @Output() resultset = new EventEmitter<SQLResponse>();
  @Output() isPending = new EventEmitter<boolean>();
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
    private sqlPlaygroundService: SqlPlaygroundService,
    private prismService: PrismService,
    private fb: FormBuilder,
    private renderer: Renderer2
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

  ngOnInit(): void {
    this.activeTabId.valueChanges.subscribe((value) => {
      this.activeTab = this.tabs[value];
    });
    this.listenForm();
    this.synchronizeScroll();
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

  private listenForm() {
    this.sub = this.groupForm.valueChanges.subscribe((val: any) => {
      const modifiedContent = this.prismService.convertHtmlIntoString(
        val.content
      );

      this.renderer.setProperty(
        this.codeContent.nativeElement,
        "innerHTML",
        modifiedContent
      );

      this.highlighted = true;
    });
  }

  private synchronizeScroll() {
    const localSub = fromEvent(this.textArea.nativeElement, "scroll").subscribe(
      () => {
        const toTop = this.textArea.nativeElement.scrollTop;
        const toLeft = this.textArea.nativeElement.scrollLeft;

        this.renderer.setProperty(this.pre.nativeElement, "scrollTop", toTop);
        this.renderer.setProperty(
          this.pre.nativeElement,
          "scrollLeft",
          toLeft + 0.2
        );
      }
    );

    this.sub.add(localSub);
  }
}

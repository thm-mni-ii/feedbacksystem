import { Component, QueryList, ViewChildren } from "@angular/core";
import { MatTab } from "@angular/material/tabs";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "src/app/dialogs/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-sql-input-tabs",
  templateUrl: "./sql-input-tabs.component.html",
  styleUrls: ["./sql-input-tabs.component.scss"],
})
export class SqlInputTabsComponent {
  constructor(private dialog: MatDialog) {}
  @ViewChildren(MatTab, { read: MatTab })
  public tabNodes: QueryList<MatTab>;
  fileName = "Query_";
  public tabs = [{ name: this.fileName }];
  toSubmit: any;
  ind: number = 0;

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

  inputValue(data: any) {
    let submissionData = data["content"];
    if (Array.isArray(submissionData)) {
      submissionData = submissionData[0];
    }
    this.toSubmit = submissionData;
  }

  addTab(index: number) {
    //this.ind = index + 1;
    this.fileName = "Query_" + (index + 1);
    this.tabs.push({ name: this.fileName });
    // this.ind = index;
  }

  private openConfirmDialog(title: string, message: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: title,
        message: message,
      },
    });
    return dialogRef.afterClosed();
  }

  downloadFile() {
    console.log(this.ind);
    var file = new Blob([this.toSubmit], { type: ".txt" });
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = this.tabs[this.ind].name + ".sql";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

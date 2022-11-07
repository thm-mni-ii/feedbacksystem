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
  public tabs = [{ name: undefined }];

  closeTab(index: number) {
    this.openConfirmDialog(
      "Möchtest du wirklich diesen Query schließen?",
      "Achtung der Inhalt wird nicht gespeichert!"
    ).subscribe((result) => {
      if (result == true) {
        this.tabs.splice(index, 1);
      }
    });
  }

  addTab(index: number) {
    this.tabs.push({ name: "Query_" + index });
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
}

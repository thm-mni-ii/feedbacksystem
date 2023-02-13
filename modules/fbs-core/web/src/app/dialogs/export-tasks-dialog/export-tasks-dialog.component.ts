import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Task } from "../../model/Task";

@Component({
  selector: "app-export-tasks-dialog",
  templateUrl: "./export-tasks-dialog.component.html",
  styleUrls: ["./export-tasks-dialog.component.scss"],
})
export class ExportTasksDialogComponent implements OnInit {
  tasks: any[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ExportTasksDialogComponent>
  ) {}

  ngOnInit(): void {
    this.createList();
  }

  export() {
    console.log("hallo");
    this.dialogRef.close({ success: true });
  }

  closeDialog() {
    this.dialogRef.close({ success: false });
  }

  createList() {
    for (var task of this.data.tasks) {
      this.tasks.push({
        id: task.id,
        name: task.name,
        index: this.tasks.length,
        selected: false,
      });
    }
  }

  select(index: number) {
    console.log(this.tasks[index].selected);
    if (this.tasks[index].selected) {
      this.tasks[index].selected = false;
    } else {
      this.tasks[index].selected = true;
    }
    console.log(this.tasks[index].selected);
  }
}

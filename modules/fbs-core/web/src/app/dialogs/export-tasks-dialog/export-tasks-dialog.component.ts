import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Task } from "../../model/Task";

@Component({
  selector: "app-export-tasks-dialog",
  templateUrl: "./export-tasks-dialog.component.html",
  styleUrls: ["./export-tasks-dialog.component.scss"],
})
export class ExportTasksDialogComponent implements OnInit {
  tasks: Task[];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    this.tasks = this.data.tasks;
  }
}

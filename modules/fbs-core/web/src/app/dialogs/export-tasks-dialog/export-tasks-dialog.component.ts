import { Component, Inject, OnInit } from "@angular/core";
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";
import { TaskService } from "src/app/service/task.service";

@Component({
  selector: "app-export-tasks-dialog",
  templateUrl: "./export-tasks-dialog.component.html",
  styleUrls: ["./export-tasks-dialog.component.scss"],
})
export class ExportTasksDialogComponent implements OnInit {
  tasks: any[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ExportTasksDialogComponent>,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.createList();
  }

  export() {
    this.dialogRef.close({ success: true });
    let selectedTasks = [];
    for (let task of this.tasks) {
      if (task.selected) {
        selectedTasks.push(task);
      }
    }

    if (selectedTasks.length == 1) {
      this.taskService.downloadTask(
        this.data.courseId,
        selectedTasks[0].id,
        selectedTasks[0].name
      );
    }

    if (selectedTasks.length > 1) {
      let taskIds = [];
      for (let task of selectedTasks) {
        taskIds.push(task.id);
      }
      this.taskService.downloadMultipleTasks(this.data.courseId, taskIds);
    }
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

  selectAll() {
    this.tasks.map((task) => {
      task.selected = true;
    });
  }

  unSelectAll() {
    this.tasks.map((task) => {
      task.selected = false;
    });
  }

  select(index: number) {
    if (this.tasks[index].selected) {
      this.tasks[index].selected = false;
    } else {
      this.tasks[index].selected = true;
    }
  }
}

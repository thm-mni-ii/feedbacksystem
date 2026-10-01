import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TaskProvider } from "../../model/TaskProvider";

@Component({
  selector: "app-task-provider-detail-dialog",
  templateUrl: "./task-provider-detail-dialog.component.html",
  styleUrls: ["./task-provider-detail-dialog.component.scss"],
})
export class TaskProviderDetailDialogComponent implements OnInit {
  taskProvider: TaskProvider;
  formattedSchema: string = "";

  constructor(
    public dialogRef: MatDialogRef<TaskProviderDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { taskProvider: TaskProvider }
  ) {
    this.taskProvider = data.taskProvider;
  }

  ngOnInit(): void {
    if (this.taskProvider?.configSchema) {
      try {
        this.formattedSchema =
          typeof this.taskProvider.configSchema === "string"
            ? JSON.stringify(
                JSON.parse(this.taskProvider.configSchema),
                null,
                2
              )
            : JSON.stringify(this.taskProvider.configSchema, null, 2);
      } catch {
        this.formattedSchema = String(this.taskProvider.configSchema);
      }
    }
  }

  isProviderActive(): boolean {
    if (
      this.taskProvider.isActive !== undefined &&
      this.taskProvider.isActive !== null
    ) {
      return Boolean(this.taskProvider.isActive);
    }
    if (
      this.taskProvider.active !== undefined &&
      this.taskProvider.active !== null
    ) {
      return Boolean(this.taskProvider.active);
    }
    return true;
  }

  close(): void {
    this.dialogRef.close();
  }
}

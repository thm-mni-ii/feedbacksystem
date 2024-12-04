import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Task } from "../../../model/Task";
import { UserTaskResult } from "../../../model/UserTaskResult";

@Component({
  selector: "app-task-preview",
  templateUrl: "./task-preview.component.html",
  styleUrls: ["./task-preview.component.scss"],
})
export class TaskPreviewComponent {
  @Input() courseId: number;
  @Input() task: Task;
  @Input() taskResult: UserTaskResult = null;
  @Input() isSelectable: boolean = false;
  @Input() isSelected: boolean = false;

  @Output() selectionChanged = new EventEmitter<boolean>();

  constructor() {}

  toggleSelection() {
    this.isSelected = !this.isSelected;
    this.selectionChanged.emit(this.isSelected);
  }
}

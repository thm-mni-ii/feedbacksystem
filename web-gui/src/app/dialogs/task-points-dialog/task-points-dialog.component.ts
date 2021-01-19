import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Task} from '../../model/Task';
import {CdkDragDrop, moveItemInArray, copyArrayItem, CdkDrag} from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-task-points-dialog',
  templateUrl: './task-points-dialog.component.html',
  styleUrls: ['./task-points-dialog.component.scss']
})
export class TaskPointsDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  tasks: Task[];
  addedTasks: Task[] = [];
  ngOnInit(): void {
    this.tasks = this.data.tasks;
    this.addedTasks.push(this.tasks.pop());
    console.log(this.data);
  }

  drop(event: CdkDragDrop<number[]>) {
    if (event.previousContainer === event.container) {
      // do nothing?
    } else {
      copyArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  /** Predicate function that only allows even numbers to be dropped into a list. */
  evenPredicate(item: CdkDrag<number>) {
    return true;
  }

  /** Predicate function that doesn't allow items to be dropped into a list. */
  noReturnPredicate() {
    return false;
  }
}

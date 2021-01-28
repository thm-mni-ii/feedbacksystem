import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Task} from '../../model/Task';
import {
  CdkDragDrop,
  copyArrayItem,
} from '@angular/cdk/drag-drop';
import {TaskPointsService} from '../../service/task-points.service';
import {Requirement} from '../../model/Requirement';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
  selector: 'app-task-points-dialog',
  templateUrl: './task-points-dialog.component.html',
  styleUrls: ['./task-points-dialog.component.scss']
})
export class TaskPointsDialogComponent implements OnInit {

  // tslint:disable-next-line:max-line-length
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private taskPointsService: TaskPointsService,
              public dialogRef: MatDialogRef<TaskPointsDialogComponent>, private dialog: MatDialog,
              private snackBar: MatSnackBar) {
  }

  tasks: Task[];
  addedTasks: Task[] = [];
  tabs = ['First', 'ghg', 'nnnnnnnnnnnnnnnnn'];
  allRequirements: Requirement[];
  selected: Requirement;
  index = 0;

  ngOnInit(): void {
    this.tasks = this.data.tasks.map(element => element);
    // this.addedTasks.push(this.tasks.pop());
    this.taskPointsService.getAllRequirements(6).subscribe(res => {
      this.allRequirements = res;
      this.selected = res[0];
    });
  }

  drop(event: CdkDragDrop<number[]>) {
    const idx = event.container.data.indexOf(event.previousContainer.data[event.previousIndex]);
    if (idx !== -1) {
      return;
    } else {
      copyArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  /** Predicate function that doesn't allow items to be dropped into a list. */
  noReturnPredicate(): boolean {
    return false;
  }

  addTab() {
    this.allRequirements.push({
      tasks: [],
      bonusFormula: '',
      toPass: 0,
      hidePoints: false
    });
    this.selected = this.allRequirements[this.allRequirements.length - 1];
  }

  changeIndex(i: any) {
    this.index = i;
    this.selected = this.allRequirements[i];
  }

  /**
   * Close dialog without changing data
   */
  closeDialog() {
    this.dialogRef.close();
  }

  unselect(index: number) {
    this.addedTasks.splice(index, 1);
  }
}

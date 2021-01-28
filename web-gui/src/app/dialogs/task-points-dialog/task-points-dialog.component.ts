import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Task} from '../../model/Task';
import {
  CdkDragDrop,
  copyArrayItem,
} from '@angular/cdk/drag-drop';
import {TaskPointsService} from '../../service/task-points.service';
import {Requirement} from '../../model/Requirement';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
  selector: 'app-task-points-dialog',
  templateUrl: './task-points-dialog.component.html',
  styleUrls: ['./task-points-dialog.component.scss']
})
export class TaskPointsDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private taskPointsService: TaskPointsService,
              private dialog: MatDialog, private snackbar: MatSnackBar,
              public dialogRef: MatDialogRef<TaskPointsDialogComponent>) { }

  tasks: Task[];
  allRequirements: Requirement[];
  selected: Requirement;
  index = 0;
  valid: boolean;

  ngOnInit(): void {
    this.tasks = this.data.tasks.map(element => element);
    // this.addedTasks.push(this.tasks.pop());
    this.taskPointsService.getAllRequirements(6).subscribe(res => {
      this.allRequirements = res;
      if (res && res.length > 0) {
        this.selected = res[0];
      } else {
        this.addTab();
      }
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
    this.index = this.allRequirements.length - 1;
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

  checkFormula(formula: string) {
    this.taskPointsService.checkBonusFormula(formula).subscribe(res => {
      this.valid = res;
    });
  }

  delete(requirement: Requirement) {
    this.dialog.open(ConfirmDialogComponent, {
      data: {title: 'Kategorie löschen', message: 'Wollen Sie diese Kategorie löschen?'}
    }).afterClosed()
      .subscribe(confirmed => {
        if (confirmed) {
          if (requirement.id) {
            this.taskPointsService.deleteRquirement(this.data.courseID, requirement.id)
              .subscribe(() => {
                this.allRequirements.splice(this.allRequirements.indexOf(requirement), 1);
                this.snackbar.open('Das Löschen war erfolgreich');
              }, error => this.snackbar.open('Es ist ein Fehler aufgetreten.'));
          } else {
            this.allRequirements.splice(this.allRequirements.indexOf(requirement), 1);
            this.snackbar.open('Das Löschen war erfolgreich', 'ok', {duration: 5000});
          }
        }
      });
  }

  save() {
    let checked = true;
    const newReq = [];
    const oldReq = [];
    for (const req of this.allRequirements) {
      this.taskPointsService.checkBonusFormula(req.bonusFormula).subscribe(res => {
        checked = res;
      });
      if (checked) {
        if (req.id) {
          oldReq.push(req);
        } else {
          newReq.push(req);
        }
      } else { break; }
    }
    if (checked) {
      for (const req of newReq) {
        this.taskPointsService.createRequirement(this.data.courseID, req).subscribe();
      }
      for (const req of oldReq) {
        this.taskPointsService.updateRquirement(this.data.courseID, req.id, req).subscribe();
      }
    } else {
      console.log('not valid');
    }
  }
}

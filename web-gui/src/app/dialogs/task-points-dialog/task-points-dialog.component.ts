import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Task} from '../../model/Task';
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
  hidePoints = false;
  toggleColor = 'primary';

  checked = false;
  allChecked = false;
  labelPosition: 'before' | 'after' = 'after';

  disabled = false;

  bonusFormular: {
    message: string,
    valid: boolean
  };

  ngOnInit(): void {
    this.tasks = this.data.tasks.map(element => element);
    this.tasks.push({
      id: 2,
      name: 'Aufgabe 2a',
      description: 'string',
      deadline: 'st'
    },
      {
        id: 1,
        name: 'Aufgabe 1a',
        description: 'string',
        deadline: 'st'
      });
    this.taskPointsService.getAllRequirements(6).subscribe(res => {
      this.allRequirements = res;
      if (res && res.length > 0) {
        this.selected = res[0];
        this.checkFormula(this.selected.bonusFormula);
      } else {
        this.addTab();
      }
      });
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
    this.checkFormula(this.selected.bonusFormula);
    this.checked = false;
  }

  /**
   * Close dialog without changing data
   */
  closeDialog() {
    this.dialogRef.close();
  }

  checkFormula(formula: string) {
    this.taskPointsService.checkBonusFormula(formula).subscribe(res => {
      this.bonusFormular = res;
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
            this.snackbar.open('Das Löschen war erfolgreich.', 'OK', {duration: 5000});
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
      } else {
        break;
      }
    }
    if (checked) {
      for (const req of newReq) {
        this.taskPointsService.createRequirement(this.data.courseID, req).subscribe();
      }
      for (const req of oldReq) {
        this.taskPointsService.updateRquirement(this.data.courseID, req.id, req).subscribe();
      }
      this.snackbar.open('Änderungen wurden gespeichert.', 'OK', {duration: 5000});
      this.dialogRef.close();
    } else {
      this.snackbar.open('Nicht alle Bonusformeln sind richtig.', 'OK', {duration: 5000});
    }
  }

  toggleChange() {
    console.log(this.hidePoints);
  }

  updateAllComplete() {
    this.allChecked = this.selected.tasks != null && this.selected.tasks.every(t => this.selected.tasks[t.id]);
  }

  getClass(task: Task): string {
    if (this.selected.tasks.find(el => el.id === task.id))  { return 'selected'; } else { return 'none'; }
  }

  selectAll() {
    if (this.checked) {
      this.selected.tasks = this.tasks.map(el => el);
    } else { this.selected.tasks = []; }
  }

  select(task: Task) {
    if (this.selected.tasks.find(el => el.id === task.id)) {
      this.selected.tasks.splice(this.selected.tasks.map(e => e.id).indexOf(task.id), 1);
      this.checked = false;
    } else {
      this.selected.tasks.push(task);
    }
  }
}

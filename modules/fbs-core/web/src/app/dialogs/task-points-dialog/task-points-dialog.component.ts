import { Component, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { Task } from "../../model/Task";
import { TaskPointsService } from "../../service/task-points.service";
import { Requirement } from "../../model/Requirement";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-task-points-dialog",
  templateUrl: "./task-points-dialog.component.html",
  styleUrls: ["./task-points-dialog.component.scss"],
})
export class TaskPointsDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private taskPointsService: TaskPointsService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    public dialogRef: MatDialogRef<TaskPointsDialogComponent>
  ) {}
  beforeUnloadTimeout: any;
  tasks: Task[];
  allRequirements: Requirement[];
  selected: Requirement;
  index = 0;
  valid: boolean;
  toggleColor = "primary";

  checked = false;
  allChecked = false;
  labelPosition: "before" | "after" = "after";

  disabled = false;

  bonusFormula: {
    message: string;
    valid: boolean;
  } = { message: "", valid: true };

  ngOnInit(): void {
    this.tasks = this.data.tasks;
    this.taskPointsService
      .getAllRequirements(this.data.courseID)
      .subscribe((res) => {
        this.allRequirements = res;
        if (res && res.length > 0) {
          // Workaround for default tab selection not working
          this.index = -1;
          setTimeout(() => this.changeIndex(0), 0);
        } else {
          this.addTab();
        }
      });
    this.allRequirements = [];
  }

  addTab() {
    this.allRequirements.push({
      toPass: 0,
      bonusFormula: "",
      tasks: [],
      hidePoints: false,
    });
    this.index = -1;
    setTimeout(() => this.changeIndex(this.allRequirements.length - 1), 0);
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
    this.taskPointsService.checkBonusFormula(formula).subscribe((response) => {
      this.bonusFormula = response;
    });
  }

  delete(requirement: Requirement) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "Kategorie löschen",
          message: "Wollen Sie diese Kategorie löschen?",
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          if (requirement.id) {
            this.taskPointsService
              .deleteRequirement(this.data.courseID, requirement.id)
              .subscribe(
                () => {
                  this.allRequirements.splice(
                    this.allRequirements.indexOf(requirement),
                    1
                  );
                  this.snackbar.open("Das Löschen war erfolgreich");
                },
                () => this.snackbar.open("Es ist ein Fehler aufgetreten.")
              );
          } else {
            this.allRequirements.splice(
              this.allRequirements.indexOf(requirement),
              1
            );
            this.snackbar.open("Das Löschen war erfolgreich.", "OK", {
              duration: 5000,
            });
          }
        }
      });
  }

  save() {
    /*window.addEventListener('beforeunload', handleBeforeUnload);
        
        function handleBeforeUnload(e) {
          e.preventDefault();
          e.returnValue = '';
        }
      
        clearTimeout(this.beforeUnloadTimeout); // Clear any existing timeout
      
        this.beforeUnloadTimeout = setTimeout(() => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
        }, 1500);*/
    let checked = true;
    const newReq = [];
    const oldReq = [];
    for (const req of this.allRequirements) {
      this.taskPointsService
        .checkBonusFormula(req.bonusFormula)
        .subscribe((response) => {
          checked = response.valid;
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
        this.taskPointsService
          .createRequirement(this.data.courseID, req)
          .subscribe();
      }
      for (const req of oldReq) {
        this.taskPointsService
          .updateRequirement(this.data.courseID, req.id, req)
          .subscribe();
      }
      this.snackbar.open("Änderungen wurden gespeichert.", "OK", {
        duration: 5000,
      });
      this.dialogRef.close();
    } else {
      this.snackbar.open("Nicht alle Bonusformeln sind richtig.", "OK", {
        duration: 5000,
      });
    }
  }

  updateAllComplete() {
    this.allChecked =
      this.selected.tasks != null &&
      this.selected.tasks.every((t) => this.selected.tasks[t.id]);
  }

  getClass(task: Task): string {
    if (
      this.selected !== undefined &&
      this.selected.tasks.find((el) => el.id === task.id)
    ) {
      return "selected";
    } else {
      return "none";
    }
  }

  selectAll() {
    if (this.checked) {
      this.selected.tasks = this.tasks.map((el) => el); // TODO: map??
    } else {
      this.selected.tasks = [];
    }
  }

  select(task: Task) {
    if (this.selected.tasks.find((el) => el.id === task.id)) {
      this.selected.tasks.splice(
        this.selected.tasks.map((e) => e.id).indexOf(task.id),
        1
      );
      this.checked = false;
    } else {
      this.selected.tasks.push(task);
    }
  }
}

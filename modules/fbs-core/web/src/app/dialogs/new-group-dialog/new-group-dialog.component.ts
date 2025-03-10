import { Component, Inject } from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
import { GroupService } from "../../service/group.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { GroupInput } from "../../model/Group";

@Component({
  selector: "app-new-group-dialog",
  templateUrl: "./new-group-dialog.component.html",
  styleUrls: ["./new-group-dialog.component.scss"],
})
export class NewGroupDialogComponent {
  name = new UntypedFormControl("", [Validators.required]);
  membership = new UntypedFormControl("", [Validators.required]);
  isVisible = true;
  isUpdateDialog: boolean;
  student: boolean;
  pending: boolean = false;

  constructor(
    private groupService: GroupService,
    public dialogRef: MatDialogRef<NewGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      cid: number;
      gid?: number;
      student?: boolean;
      isUpdateDialog: boolean;
    }
  ) {
    this.isUpdateDialog = data.isUpdateDialog;
    this.student = data.student;
    /**if (data.student) {*/
    this.loadGroupData();
    /**  }*/
  }

  loadGroupData() {
    if (this.data.gid) {
      this.groupService
        .getGroup(this.data.cid, this.data.gid)
        .subscribe((group) => {
          this.name.setValue(group.name);
          this.membership.setValue(group.membership);
          this.isVisible = group.visible;
        });
    }
  }

  createGroup() {
    if (!this.isInputValid()) {
      this.pending = false;
      return;
    }

    const group: GroupInput = {
      name: this.name.value,
      membership: this.membership.value,
      visible: this.isVisible,
    };

    this.pending = true;

    if (this.isUpdateDialog) {
      this.groupService
        .updateGroup(this.data.cid, this.data.gid, group)
        .subscribe(
          () => {
            this.dialogRef.close({ success: true });
          },
          (error) => {
            console.log(error);
            this.dialogRef.close({ success: false });
          }
        );
    } else {
      this.groupService.createGroup(this.data.cid, group).subscribe(
        () => {
          this.dialogRef.close({ success: true });
        },
        (error) => {
          console.log(error);
          this.dialogRef.close({ success: false });
        }
      );
    }
  }

  isInputValid(): boolean {
    return this.name.valid && this.membership.valid;
  }

  closeDialog() {
    this.dialogRef.close({ success: false });
  }
}

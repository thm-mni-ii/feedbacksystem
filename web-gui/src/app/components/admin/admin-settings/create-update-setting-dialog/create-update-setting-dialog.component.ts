import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {GlobalSetting} from "../../../../interfaces/HttpInterfaces";

@Component({
  selector: 'app-create-update-setting-dialog',
  templateUrl: './create-update-setting-dialog.component.html',
  styleUrls: ['./create-update-setting-dialog.component.scss']
})
export class CreateUpdateSettingDialogComponent {

  new_setting: boolean = true;

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<CreateUpdateSettingDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: GlobalSetting) {
    this.new_setting = (typeof this.data.setting_key === 'undefined' || this.data.setting_key.length == 0)
  }

  onCancel(): void {
    this.data.setting_key = '';
    this.data.setting_typ = '';
    this.data.setting_val = '';

    this.dialogRef.close(null);
  }

  onSubmit(): void {
    this.dialogRef.close(this.data);
  }

}

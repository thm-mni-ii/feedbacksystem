import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {GlobalSetting} from "../../../../interfaces/HttpInterfaces";

@Component({
  selector: 'app-delete-setting-dialog',
  templateUrl: './delete-setting-dialog.component.html',
  styleUrls: ['./delete-setting-dialog.component.scss']
})
export class DeleteSettingDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: GlobalSetting, public dialogRef: MatDialogRef<DeleteSettingDialogComponent>) { }

  ngOnInit() {
  }

  delete(exit: boolean) {
    this.dialogRef.close({exit: exit});
  }

}

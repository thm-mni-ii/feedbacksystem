import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../service/auth.service';
import {Roles} from '../../model/Roles';
import {LegalService} from '../../service/legal.service';
import {GoToService} from '../../service/goto.service';

/**
 * Data privacy dialog
 */
@Component({
  selector: 'app-goto-links-dialog',
  templateUrl: './goto-links-dialog.component.html',
  styleUrls: ['./goto-links-dialog.component.scss']
})
export class GotoLinksDialogComponent {
  courseLink: string;
  appLink: string;

  constructor(public dialogRef: MatDialogRef<GotoLinksDialogComponent>, @Inject(MAT_DIALOG_DATA) data: {courseID: number},
              gotoService: GoToService) {
    this.courseLink = gotoService.buildLink(data.courseID);
    this.appLink = gotoService.buildLink(data.courseID, true);
  }

  copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  close() {
    this.dialogRef.close();
  }
}

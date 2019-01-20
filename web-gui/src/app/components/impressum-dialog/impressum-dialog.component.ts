import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-impressum-dialog',
  templateUrl: './impressum-dialog.component.html',
  styleUrls: ['./impressum-dialog.component.scss']
})
export class ImpressumDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ImpressumDialogComponent>) {
  }

  ngOnInit() {
  }


  close() {
    this.dialogRef.close();
  }

}

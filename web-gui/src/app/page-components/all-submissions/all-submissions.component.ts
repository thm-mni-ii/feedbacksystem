import {Component, Inject, ViewChild, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatAccordion} from "@angular/material/expansion";
import {Submission} from "../../model/Submission";

@Component({
  selector: 'app-all-submissions',
  templateUrl: './all-submissions.component.html',
  styleUrls: ['./all-submissions.component.scss']
})
export class AllSubmissionsComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  constructor(@Inject(MAT_DIALOG_DATA) public data: {submission: Submission[],  auth:boolean}, public dialogRef: MatDialogRef<AllSubmissionsComponent>) { }

  ngOnInit(): void {
  }


  close() {
    this.dialogRef.close()
  }
}

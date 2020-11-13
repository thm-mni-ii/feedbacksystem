import {Component, Inject, ViewChild, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatAccordion} from "@angular/material/expansion";
import {Submission} from "../../model/Submission";
import {MatTableDataSource} from "@angular/material/table";
import {CheckResult} from "../../model/CheckResult";

@Component({
  selector: 'app-all-submissions',
  templateUrl: './all-submissions.component.html',
  styleUrls: ['./all-submissions.component.scss']
})
export class AllSubmissionsComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  constructor(@Inject(MAT_DIALOG_DATA) public data: {submission: Submission[],  auth:boolean}, public dialogRef: MatDialogRef<AllSubmissionsComponent>) { }

  selectedSubmission: Submission;
  selectedInfo: object[];
  ngOnInit(): void {
    this.selectedSubmission = this.data.submission[this.data.submission.length-1];
    this.selectedInfo = this.selectedSubmission.results.map(res => res.extInfo)
  }

  selectSubmission(sub: Submission) {
    this.selectedSubmission = sub
    this.selectedSubmission.results.map(res => {
      if(res.extInfo) {
        this.selectedInfo.push(res.extInfo)
      }
    })
  }


  close() {
    this.dialogRef.close()
  }
}

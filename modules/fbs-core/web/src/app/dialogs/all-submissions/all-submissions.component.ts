import { Component, Inject } from "@angular/core";
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";
import { Submission } from "../../model/Submission";

@Component({
  selector: "app-all-submissions",
  templateUrl: "./all-submissions.component.html",
  styleUrls: ["./all-submissions.component.scss"],
})
export class AllSubmissionsComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      submission: Submission[];
      context: { uid: number; cid: number; tid: number };
      isText: Boolean;
    },
    public dialogRef: MatDialogRef<AllSubmissionsComponent>
  ) {}

  close() {
    this.dialogRef.close();
  }
}

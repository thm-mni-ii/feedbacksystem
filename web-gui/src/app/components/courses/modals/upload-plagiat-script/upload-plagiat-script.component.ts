import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {DatabaseService} from "../../../../service/database.service";

@Component({
  selector: 'app-upload-plagiat-script',
  templateUrl: './upload-plagiat-script.component.html',
  styleUrls: ['./upload-plagiat-script.component.scss']
})
export class UploadPlagiatScriptComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<UploadPlagiatScriptComponent>,
              private db: DatabaseService) { }

  ngOnInit() {
  }

  close(exit: boolean) {
    this.dialogRef.close({exit: exit});
  }

  onFilesAdded(files: File[]) {
    console.log(files);

    files.forEach(file => {
      console.log(this.data.courseid)
      this.db.submitPlagiatScript(file, this.data.courseid).toPromise()
        .then(d => console.log(d))
        .catch(e => console.log(e))


    });
  }

  onFilesRejected(files: File[]) {
    console.log(files);
  }

}

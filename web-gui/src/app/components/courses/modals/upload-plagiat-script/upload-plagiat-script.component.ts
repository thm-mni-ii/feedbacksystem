import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
  selector: 'app-upload-plagiat-script',
  templateUrl: './upload-plagiat-script.component.html',
  styleUrls: ['./upload-plagiat-script.component.scss']
})
export class UploadPlagiatScriptComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<UploadPlagiatScriptComponent>) { }

  ngOnInit() {
  }

  close(exit: boolean) {
    this.dialogRef.close({exit: exit});
  }

  onFilesAdded(files: File[]) {
    console.log(files);

    files.forEach(file => {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent) => {
        const content = (e.target as FileReader).result;

        // this content string could be used directly as an image source
        // or be uploaded to a webserver via HTTP request.
        console.log(content);
      };

      // use this for basic text files like .txt or .csv
      reader.readAsText(file);

      // use this for images
      reader.readAsDataURL(file);
    });
  }

  onFilesRejected(files: File[]) {
    console.log(files);
  }

}

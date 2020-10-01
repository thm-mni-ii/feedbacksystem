import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DatabaseService} from "../../service/database.service";
import {Succeeded} from "../../model/HttpInterfaces";

@Component({
  selector: 'app-plagiat-script-upload',
  templateUrl: './plagiat-script-upload.component.html',
  styleUrls: ['./plagiat-script-upload.component.scss']
})
export class PlagiatScriptUploadComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<PlagiatScriptUploadComponent>,
              private db: DatabaseService,  private snackbar: MatSnackBar) { }

  ngOnInit() {
  }

  close(exit: boolean) {
    this.dialogRef.close({exit: exit});
  }

  deleteFiles(exit: boolean){

  }

  onFilesAdded(files: File[]) {
    console.log(files);

    files.forEach(file => {
      console.log(this.data.courseid)
      this.db.submitPlagiatScript(file, this.data.courseid).toPromise()
        .then((answer:Succeeded) => {
          if(answer.success){
            this.snackbar.open('Script wurde erfolgreich hochgeladen', 'OK', {duration: 5000})
            this.close(true)
          } else {
            this.snackbar.open('Es gab ein Problem beim Hochladen vom Skript.', 'OK', {duration: 5000})
          }
        })
        .catch(e => console.log(e))


    });
  }

  onFilesRejected(files: File[]) {
    console.log(files);
  }

}

import {Component} from '@angular/core';
import {DatabaseService} from "../../../service/database.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";

@Component({
  selector: 'app-import-course',
  templateUrl: './import-course.component.html',
  styleUrls: ['./import-course.component.scss']
})
export class ImportCourseComponent {
  importMode: string = 'createCourse';
  courseId: number;
  filesToUpload: File[];

  constructor(private db: DatabaseService,  private snackbar: MatSnackBar, private router: Router) { }

  onFilesAdded(files: File[]) {
    this.filesToUpload = files;
  }

  private snackOK(){
    return this.snackbar.open("Super, der Import hat funktioniert", 'OK', {duration: 3000}).afterDismissed().toPromise()
  }

  showOK(){
    this.snackOK().then(() => this.router.navigate(['courses', 'user']) )
  }

  showError(msg: string){
    this.snackbar.open("Leider hat der Import nicht funktioniert, mit dieser Meldung: " + msg, 'OK', {duration: 3000});
  }

  onSubmit(){
    if (this.filesToUpload.length != 1) {
      this.snackbar.open("Bitte nur eine Zip Datei für den Import angeben", 'OK', {duration: 3000});
    }

    if (this.importMode == 'recover'){
      if (!this.courseId) {
        this.snackbar.open("Bitte eine Course ID eingeben", 'OK', {duration: 3000});
      } else {
        this.db.recoverCourse(this.courseId, this.filesToUpload).then(data => this.showOK()).catch(e => this.showError(e))
      }
    } else if (this.importMode == 'createCourse'){
      this.db.importCompleteCourse(this.filesToUpload).then(data => {
        this.snackOK().then(() => {
          this.router.navigate(['courses', data['course_id']], {fragment: 'edit'})
        })
      }).catch(e => this.showError(e))
    }
  }

  onFilesRejected(files: File[]) {
    // Todo need to remove it somehow
    console.log(files);
  }
}

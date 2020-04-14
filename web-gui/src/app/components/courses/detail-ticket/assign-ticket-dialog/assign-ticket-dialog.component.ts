import {Component, Inject, OnInit, Pipe, PipeTransform} from '@angular/core';
import {User} from "../../../../interfaces/HttpInterfaces";
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UpdateCourseDialogComponent} from "../../detail-course/update-course-dialog/update-course-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-assign-ticket-dialog',
  templateUrl: './assign-ticket-dialog.component.html',
  styleUrls: ['./assign-ticket-dialog.component.scss']
})
export class AssignTicketDialogComponent implements OnInit {
  users:User[];
  ticket:any;
  courseID:number;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<UpdateCourseDialogComponent>,private snackBar: MatSnackBar) {
  }
  ngOnInit(): void {
    this.users = this.data.users;
    this.ticket = this.data.ticket;
    this.courseID = this.data.courseID;
  }
  public assignTicket(teacher){
    console.log(teacher)
    this.snackBar.open(`${teacher.prename} ${teacher.surname} wurde dem Ticket als Bearbeiter zugewiesen`, 'OK', {duration: 3000})
    this.dialogRef.close()
  }
}

@Pipe({
  name: 'isTeacher',
  pure: false
})
export class UserTeacherFilter implements PipeTransform {
  transform(items: any[]): any {
    if (!items) {
      return items;
    }
    //role_ids
    //admin = 1
    //mod = 2
    //docent = 4
    //tutor = 8
    //todo: role identification function
    return items.filter(item =>  item.role_id <= 8);
  }
}

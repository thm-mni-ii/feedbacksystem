import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Ticket} from '../../../../interfaces/HttpInterfaces';
import {ClassroomService} from '../../../../service/classroom.service';
import {UserService} from '../../../../service/user.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-newticket-dialog',
  templateUrl: './newticket-dialog.component.html',
  styleUrls: ['./newticket-dialog.component.scss']
})
export class NewticketDialogComponent implements OnInit {
  form: FormGroup;


  constructor(private _formBuilder: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any,
              private snackBar: MatSnackBar, public dialogRef: MatDialogRef<NewticketDialogComponent>,
              private classroomService: ClassroomService, private userService: UserService) { }

  ngOnInit(): void {
    this.form = this._formBuilder.group({
      title: '',
      desc: '',
      priority: 0,
    });
  }

  createTicket() {
     const ticket: Ticket = {
       id: null,
       title: this.form.get('title').value,
       desc: this.form.get('desc').value,
       priority: this.form.get('priority').value,
       courseId: null,
       timestamp: Date.now(),
       status: 'open',
       creator: null,
       assignee: null,
     };
     this.classroomService.createTicket(ticket);
     this.snackBar.open(`Das Ticket wurde erfolgreich erstellt.`, 'OK', {duration: 3000});
    this.dialogRef.close();
  }
  close() {
    this.dialogRef.close();
  }
}

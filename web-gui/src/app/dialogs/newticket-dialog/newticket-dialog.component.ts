import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ClassroomService} from '../../service/classroom.service';
import {UserService} from '../../service/user.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatSliderModule} from '@angular/material/slider';
import {Ticket} from '../../model/Ticket';

@Component({
  selector: 'app-newticket-dialog',
  templateUrl: './newticket-dialog.component.html',
  styleUrls: ['./newticket-dialog.component.scss']
})
export class NewticketDialogComponent implements OnInit {
  form: FormGroup;
  priority: number;

  constructor(private _formBuilder: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any,
              private snackBar: MatSnackBar, public dialogRef: MatDialogRef<NewticketDialogComponent>,
              private classroomService: ClassroomService, private userService: UserService,
              private matSliderModule: MatSliderModule) { }

  ngOnInit(): void {
    this.form = this._formBuilder.group({
      desc: '',
      priority: 1,
    });
  }

  createTicket() {
     const ticket: Ticket = {
       id: null,
       desc: this.form.get('desc').value.trim(),
       priority: this.form.get('priority').value,
       courseId: null,
       timestamp: Date.now(),
       status: 'open',
       creator: null,
       assignee: null,
     };
     if (ticket.desc !== '' && ticket.priority > 0 && ticket.priority <= 10) {
       this.classroomService.createTicket(ticket);
       this.snackBar.open(`Das Ticket wurde erfolgreich erstellt.`, 'OK', {duration: 3000});
       this.dialogRef.close();
     } else {
       this.snackBar.open(`Das Ticket konnte nicht erstellt werden!`, 'OK', {duration: 3000});
     }
  }

  close() {
    this.dialogRef.close();
  }
}

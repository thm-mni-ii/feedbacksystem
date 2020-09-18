import {Component, Inject, OnInit} from '@angular/core';
import {ClassroomService} from '../../../../service/classroom.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Ticket} from '../../../../interfaces/HttpInterfaces';
import {Observable} from 'rxjs';
import {first} from 'rxjs/operators';
import {UserService} from '../../../../service/user.service';

@Component({
  selector: 'app-close-ticket-dialog',
  templateUrl: './close-ticket-dialog.component.html',
  styleUrls: ['./close-ticket-dialog.component.scss']
})
export class CloseTicketDialogComponent implements OnInit {
  tickets: Observable<Ticket[]>;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private classroomService: ClassroomService, private snackBar: MatSnackBar,
              private dialogRef: MatDialogRef<any>, private user: UserService,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    this.tickets = this.classroomService.getTickets();
  }

  public closeTickets() {
    this.tickets.pipe(first()).subscribe(t => {
      t.forEach(ticket => {
        // @ts-ignore
        if (ticket.assignee != undefined && ticket.assignee.username == this.user.getUsername()) {
          this.classroomService.removeTicket(ticket);
        }
      });
    });
    this.snackBar.open(`Tickets erfolgreich geschlossen.`, 'OK', {duration: 3000});
    this.dialogRef.close(this.data.user);
  }
  public abort() {
    this.dialogRef.close(this.data.user);
  }
}

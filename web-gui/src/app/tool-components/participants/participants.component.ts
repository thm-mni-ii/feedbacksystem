import {Component, OnInit, ViewChild} from '@angular/core';
import {CourseRegistrationService} from '../../service/course-registration.service';
import {Participant} from '../../model/Participant';
import {User} from '../../model/User';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserService} from '../../service/user.service';
import {ActivatedRoute} from '@angular/router';
import {Roles} from '../../model/Roles';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-participants',
  templateUrl: './participants.component.html',
  styleUrls: ['./participants.component.scss']
})
export class ParticipantsComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  courseID = 0;
  columns = ['surname', 'prename', 'email', 'globalRole', 'action'];
  dataSource = new MatTableDataSource<User>();
  user: User[];
  participants: Participant[];
  allUser: User[];
  searchedUser: User[];

  constructor(private snackBar: MatSnackBar, private userService: UserService,
              private dialog: MatDialog,
              private registrationService: CourseRegistrationService,
              private route: ActivatedRoute) { }


  ngOnInit(): void {
    this.route.params.subscribe(
      param => {
        this.courseID = param.id;
        this.userService.getAllUsers().subscribe(
          user => {
            this.allUser = user;
            this.searchedUser = user;
            this.refreshUserList();
          }
        );
      }
    );
  }

  private refreshUserList() {
    this.user = [];
    this.registrationService.getCourseParticipants(this.courseID)
      .subscribe(
      participants => {
        this.participants = participants;
        participants.map(participant => {
          this.user.push(participant.user);
        });
        this.dataSource.data = this.user;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sortingDataAccessor = (user: User, field: string) => {
          if (field === 'globalRole') {
            return Roles.CourseRole.getSortOrder(this.getRole(user.id));
          }

          return user[field];
        };
      });
  }

  getRole(userID: number): string {
    return this.participants.find(participant => participant.user.id === userID).role.value;
  }

  /**
   * Docent selects new role for user
   * @param userID The id of user
   * @param role Selected role
   */
  roleChange(userID: number, role: string) {
    this.registrationService.registerCourse(userID, this.courseID, role)
      .subscribe(res => {
        this.snackBar.open('Benutzerrolle wurde geändert.', 'OK', {duration: 5000});
        this.refreshUserList();
      }, () => {
        this.snackBar.open('Leider gab es einen Fehler mit dem Update', 'OK', {duration: 5000});
      });
  }

  /**
   * User gets deleted
   * @param user The user to delete
   */
  unregister(user: User) {
    this.openDialog('Title', 'Soll der Benutzer ausgetragen werden?').subscribe( result => {
      if (result === true) {
        this.registrationService.deregisterCourse(user.id, this.courseID).subscribe(
          () => {
            this.snackBar.open('Der Benutzer ' + user.prename + ' ' + user.surname + ' wurde ausgetragen.', 'OK', {duration: 5000});
            this.refreshUserList();
          });
      }
    });
    }

  unregisterStudent() {
    this.openDialog('Title', 'Sollen alle Studierenden ausgetragen werden?').subscribe( result => {
      if (result === true) {
        this.registrationService.deregisterRole(this.courseID, Roles.CourseRole.STUDENT)
          .subscribe(() => {
            this.snackBar.open('Alle Studierenden wurden entfernt', 'ok', {duration: 3000});
            this.refreshUserList();
          });
      }
    });
  }

  unregisterTutor() {
    this.openDialog('Title', 'Möchten Sie alle Tutoren austragen?').subscribe( result => {
      if (result === true) {
        this.registrationService.deregisterRole(this.courseID, Roles.CourseRole.TUTOR)
          .subscribe(() => {
            this.openDialog('Title', 'Alle Tutoren wurden entfernt');
            this.refreshUserList();
          });
      }
    });
  }

  /**
   * Docent searches for user
   * @param filterValue String the admin provides to search for
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.searchedUser = this.allUser.filter((user) => {
      return (
        user.prename.toLocaleLowerCase().includes(filterValue.trim().toLowerCase()) ||
        user.surname.toLocaleLowerCase().includes(filterValue.trim().toLocaleLowerCase())
      );
    });
  }

  addParticipant(user: User) {
    this.openDialog('Title', 'Soll ' + user.prename + ' ' + user.surname + ' dem Kurs hinzugefügt werden?').subscribe( result => {
      if (result === true) {
        if (this.user.find(participant => participant.id === user.id)) {
          // this.snackBar.open(user.prename + ' ' + user.surname + ' nimmt bereits an dem Kurs teil.', 'ok', {duration: 3000});
          this.openDialog('Title', user.prename + ' ' + user.surname + ' nimmt bereits an dem Kurs teil.');
        } else {
          this.registrationService.registerCourse(user.id, this.courseID)
            .subscribe(() => {
              this.snackBar.open('Teilnehmende Personen wurden hinzugefügt.', 'OK', {duration: 5000});
              this.refreshUserList();
            });
        }
      }
    });
  }

  unregisterAll() {
    this.openDialog('Title', 'Möchten Sie alle teilnehmende Personen austragen?').subscribe( result => {
      if (result === true) {
        this.registrationService.deregisterAll(this.courseID).subscribe(
          () => {
            this.snackBar.open('Alle teilnehmenden Personen wurden ausgetragen.', 'OK', {duration: 5000});
            this.refreshUserList();
          });
      }
    });
  }

  displayFn(user?: User): string | undefined {
    return user ? user.surname : undefined;
  }
  private openDialog(title: string, message: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: message,
        buttonText: {
          title: title,
          ok: 'Ok',
          cancel: 'Abbrechen'
        }
      }
    });
    return dialogRef.afterClosed();
  }
}


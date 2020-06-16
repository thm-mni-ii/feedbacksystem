import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {DatabaseService} from '../../../service/database.service';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {flatMap} from 'rxjs/operators';
import {TitlebarService} from '../../../service/titlebar.service';
import {User} from '../../../interfaces/HttpInterfaces';
import {DeleteUserModalComponent} from "../../modals/delete-user-modal/delete-user-modal.component";
import {AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {throwError} from "rxjs";
import {MatPaginator} from "@angular/material/paginator";

export interface GuestUserAccount {
  gPrename: string;
  gSurname: string;
  gPassword: string;
  gPasswordRepeat: string;
  gUsername: string;
  gEmail: string;
  gRole: number;
}

/**
 * This component is for admin managing
 * users
 */
@Component({
  selector: 'app-admin-user-management',
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.scss']
})
export class AdminUserManagementComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(private db: DatabaseService, private snackBar: MatSnackBar, private titlebar: TitlebarService,
              private dialog: MatDialog) {
  }

  columns = ['surname', 'prename', 'email', 'username', 'role_id', 'action'];
  dataSource = new MatTableDataSource<User>();

  // Guest Account

  userData: GuestUserAccount = {
    gPrename: '',
    gSurname: '',
    gPassword: '',
    gPasswordRepeat: '',
    gUsername: '',
    gEmail: '',
    gRole: 16
  };

  ngOnInit() {
    this.titlebar.emitTitle('Benutzer Verwaltung');
    this.loadAllUsers();
  }

  private loadAllUsers() {
    this.db.getAllUsers().subscribe(users => {
      this.dataSource.data = users;
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  /**
   * Admin selects new role for user
   * @param username The username of current user
   * @param userID The id of user
   * @param role Selected role from admin
   */
  roleChange(username: string, userID: number, role: number) {
    if (Number(role) === 4 || Number(role) === 8) {
      this.snackBar.open('Bitte über "Dozent/Tutor bestimmen" auswählen', 'OK', {duration: 5000});
      return;
    }

    this.db.changeUserRole(userID, role).subscribe(res => {
      if (res.success) {
        this.snackBar.open(username + ' ist jetzt ' + res.grant, 'OK', {duration: 3000});
      } else {
        this.snackBar.open('Fehler', 'OK', {duration: 3000});
      }
    });
  }

  /**
   * User gets deleted
   * @param user The user to delete
   */
  deleteUser(user: User) {
    this.dialog.open(DeleteUserModalComponent, {
      data: user
    }).afterClosed().pipe(
      flatMap(value => {
        if (value.exit) {
          return this.db.adminDeleteUser(user.user_id)
        } else {
          return null
        }
      })
    ).toPromise().then((result) => {
      if (result.success) {
        this.snackBar.open(user.username + ' wurde gelöscht');
        this.loadAllUsers();
      }
    }).catch(e => {
    })

  }

  /**
   * Admin searches for user
   * @param filterValue String the admin provides to search for
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  showGuestUserDialog() {
    const dialogRef = this.dialog.open(CreateGuestUserDialog, {
      width: '500px',
      data: this.userData
    });

    dialogRef.afterClosed()
      .subscribe(user => {
        if (user) {
          this.db.createGuestUser(user.gUsername, user.gPassword, user.gRole, user.gPrename, user.gSurname, user.gEmail).pipe(
            flatMap(result => (result.success) ? this.db.getAllUsers() : throwError(result))
          ).subscribe(users => {
            this.snackBar.open('Gast Benutzer erstellt', null, {duration: 5000});
            this.dataSource.data = users;
            this.resetUserData();
          }, error => {
            this.snackBar.open('Error: ' + error.message, null, {duration: 5000});
          });
        }
      });
  }

  private resetUserData(): void {
    this.userData.gPrename = '';
    this.userData.gSurname = '';
    this.userData.gEmail = '';
    this.userData.gPassword = '';
    this.userData.gRole = 16;
    this.userData.gUsername = '';
  }
}

@Component({
  selector: 'create-guest-user-dialog',
  templateUrl: 'create-guest-user-dialog.html',
  styleUrls: ['./create-guest-user-dialog.scss']
})
export class CreateGuestUserDialog {

  private passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    return control.value == this.data.gPassword ? null : {'notMatch': true};
  };

  passwordMatcher = new FormControl('', [Validators.required, this.passwordsMatchValidator]);

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<CreateGuestUserDialog>,
              @Inject(MAT_DIALOG_DATA) public data: GuestUserAccount,
              private snackBar: MatSnackBar) {
  }

  onCancel(): void {
    this.data.gPrename = '';
    this.data.gSurname = '';
    this.data.gEmail = '';
    this.data.gPassword = '';
    this.data.gPasswordRepeat = '';
    this.data.gUsername = '';
    this.data.gRole = 16;
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.data.gPassword === this.data.gPasswordRepeat)
      this.dialogRef.close(this.data);
    else
      this.snackBar.open('Error: ' + "Die Passwörter müssen übereinstimmen", null, {duration: 5000});
      }
}

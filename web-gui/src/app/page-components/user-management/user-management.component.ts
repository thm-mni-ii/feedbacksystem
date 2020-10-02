import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {DatabaseService} from "../../service/database.service";
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {flatMap} from 'rxjs/operators';
import {TitlebarService} from "../../service/titlebar.service";
// import {User} from "../../model/HttpInterfaces";
import {UserDeleteModalComponent} from "../../dialogs/user-delete-modal/user-delete-modal.component";
import {AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {throwError} from "rxjs";
import {MatPaginator} from "@angular/material/paginator";
import {UserService} from "../../service/user.service";
import {User} from "../../model/User";

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
 * This component is for admin managing users
 */
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(private db: DatabaseService, private snackBar: MatSnackBar, private titlebar: TitlebarService,
              private dialog: MatDialog, private userService: UserService) {
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
    // this.db.getAllUsers().subscribe(users => {
    this.userService.getAllUsers().subscribe(users => {
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
    // TODOD: neuer User Service hat noch kein Observable return
    // this.dialog.open(DeleteUserModalComponent, {
    //   data: user
    // }).afterClosed().pipe(
    //   flatMap(value => {
    //     if (value.exit) {
    //       return this.db.adminDeleteUser(user.id)
    //     } else {
    //       return null
    //     }
    //   })
    // ).toPromise().then((result) => {
    //   if (result.success) {
    //     this.snackBar.open(user.username + ' wurde gelöscht');
    //     this.loadAllUsers();
    //   }
    // }).catch(e => {
    // })

  }

  /**
   * Admin searches for user
   * @param filterValue String the admin provides to search for
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  showGuestUserDialog() {
    /*const dialogRef = this.dialog.open(CreateGuestUserDialog, {
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
      });*/
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

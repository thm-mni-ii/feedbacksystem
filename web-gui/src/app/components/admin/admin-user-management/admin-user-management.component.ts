import {Component, OnInit, ViewChild} from '@angular/core';
import {DatabaseService} from '../../../service/database.service';
import {MatSnackBar, MatSort, MatTableDataSource} from '@angular/material';
import {flatMap} from 'rxjs/operators';
import {TitlebarService} from '../../../service/titlebar.service';
import {User} from '../../../interfaces/HttpInterfaces';

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

  constructor(private db: DatabaseService, private snackBar: MatSnackBar, private titlebar: TitlebarService) {
  }


  columns = ['surname', 'prename', 'email', 'username', 'last_login', 'role_id', 'action'];
  dataSource = new MatTableDataSource<User>();

  // Guest Account
  gPrename: string;
  gSurname: string;
  gPassword: string;
  gUsername: string;
  gEmail: string;
  gRole: number;

  ngOnInit() {
    this.gRole = 16;
    this.titlebar.emitTitle('User Management');

    this.db.getAllUsers().subscribe(users => {
      this.dataSource.data = users;
      this.dataSource.sort = this.sort;
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
    this.db.adminDeleteUser(user.user_id).pipe(
      flatMap((result) => {

        if (result.success) {
          this.snackBar.open(user.username + ' wurde gelöscht');
        }

        return this.db.getAllUsers();
      })).subscribe(users => {
      this.dataSource.data = users;
    });

  }


  /**
   * Admin searches for user
   * @param filterValue String the admin provides to search for
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createGuestAccount() {
    if (!this.gUsername || !this.gPassword || !this.gRole || !this.gPrename || !this.gSurname || !this.gEmail) {
      this.snackBar.open('Bitte alle Felder ausfüllen', 'OK');
      return;
    }

    this.db.createGuestUser(this.gUsername, this.gPassword, this.gRole, this.gPrename, this.gSurname, this.gEmail).pipe(
      flatMap(success => {
        if (success.success) {
          this.snackBar.open('Gast ' + this.gUsername + ' erstellt', null, {duration: 5000});
          return this.db.getAllUsers();
        }
      })).subscribe(users => {
      this.dataSource.data = users;
      this.gPrename = '';
      this.gSurname = '';
      this.gEmail = '';
      this.gPassword = '';
      this.gRole = null;
      this.gUsername = '';
    });
  }


}

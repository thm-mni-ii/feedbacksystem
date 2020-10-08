import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from '@angular/material/sort';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {TitlebarService} from "../../service/titlebar.service";
import {UserService} from "../../service/user.service";
import {User} from "../../model/User";
import {CreateGuestUserDialog} from "../../dialogs/create-guest-user-dialog/create-guest-user-dialog.component";
import {UserDeleteModalComponent} from "../../dialogs/user-delete-modal/user-delete-modal.component";

/**
 * This component is for admins managing users
 */
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  columns = ['surname', 'prename', 'email', 'username', 'globalRole', 'action'];
  dataSource = new MatTableDataSource<User>();

  constructor(private snackBar: MatSnackBar, private titlebar: TitlebarService,
              private dialog: MatDialog, private userService: UserService) {
  }

  ngOnInit() {
    this.titlebar.emitTitle('Benutzerverwaltung');
    this.refreshUserList();
  }

  private refreshUserList() {
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
  roleChange(username: string, userID: number, role: string) {
    this.userService.changeRole(userID, role).subscribe(res => {
        this.snackBar.open("Benutzerrolle wurde geändert.","OK",{duration: 5000});
        this.refreshUserList()
      }, error => {
        this.snackBar.open("Leider gab es einen Fehler mit dem Update","OK", {duration: 5000})
      });
  }

  /**
   * User gets deleted
   * @param user The user to delete
   */
  deleteUser(user: User) {
    this.dialog.open(UserDeleteModalComponent, {
      data: user
    }).afterClosed().subscribe(
      res => {
          this.snackBar.open("Benutzer wurde gelöscht.","OK",{duration: 5000});
      }, error => {
        this.snackBar.open("Leider gab es einen Fehler.","OK", {duration: 5000})
      });
  }

  /**
   * Admin searches for user
   * @param filterValue String the admin provides to search for
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Opens dialog to create a new local user
   */
  showGuestUserDialog() {
    this.dialog.open(CreateGuestUserDialog, {
      width: '500px',
    }).afterClosed().subscribe(user => {
        if (user) {
          this.userService.createUser(user).subscribe(
            res => {
              this.snackBar.open('Gast Benutzer erstellt', null, {duration: 5000});
              this.refreshUserList()
            }, error => {
              this.snackBar.open('Error: ' + error.message, null, {duration: 5000});
            });
        }
      });
  }
}

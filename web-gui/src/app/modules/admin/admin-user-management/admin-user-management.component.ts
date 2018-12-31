import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DatabaseService, User} from "../../../service/database.service";
import {Subscription} from "rxjs";
import {MatSnackBar, MatSort, MatTableDataSource} from "@angular/material";

/**
 * This component is for admin managing
 * users
 */
@Component({
  selector: 'app-admin-user-management',
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.scss']
})
export class AdminUserManagementComponent implements OnInit, OnDestroy {

  @ViewChild(MatSort) sort: MatSort;

  constructor(private db: DatabaseService, private snackBar: MatSnackBar) {
  }

  private getUserSubs: Subscription;

  displayedColumns_moderator = ['username', 'prename', 'surname', 'email', 'user_id', 'role_id', 'action'];
  displayedColumns_deleteUser = ['username', 'email', 'last_login', 'action'];
  matTableDataSource = new MatTableDataSource<User>();

  ngOnInit() {
    this.getUserSubs = this.db.adminGetUsers().subscribe(users => {
        this.matTableDataSource.data = users;
      }, err => {
        console.log(err)
      },
      () => {
        this.matTableDataSource.sort = this.sort;
      });
  }


  ngOnDestroy(): void {
    this.getUserSubs.unsubscribe();
  }


  private toModerator(username: string) {
    let grantModSub = this.db.adminGrantModerator(username).subscribe(res => {
        if (res.success) {
          this.snackBar.open(username + " ist jetzt Moderator", "OK", {duration: 3000});
        } else {
          this.snackBar.open('Es ist ein Fehler aufgetreten',
            "OK", {duration: 3000});
        }
      },
      err => {
        console.log(err);
      },
      () => {
        this.db.adminGetUsers().subscribe(users => {
          this.matTableDataSource.data = users;
        });
        grantModSub.unsubscribe();
      });
  }

  private revokeModerator(username: string) {
    let revokeModSub = this.db.adminRevokeGlobal(username).subscribe(res => {
        if (res.revoke) {
          this.snackBar.open(username + " ist kein Moderator mehr", "OK", {duration: 3000});
        } else {
          this.snackBar.open('Es ist ein Fehler aufgetreten',
            "OK", {duration: 3000});
        }
      },
      err => {
        console.log(err);
      },
      () => {
        this.db.adminGetUsers().subscribe(users => {
          this.matTableDataSource.data = users;
        });
        revokeModSub.unsubscribe();
      });
  }

  private deleteUser(user: User) {
    this.db.adminDeleteUser(user.user_id);
  }


}

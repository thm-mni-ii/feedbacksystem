import {Component, OnInit, ViewChild} from '@angular/core';
import {GlobalSetting} from "../../../interfaces/HttpInterfaces";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {DatabaseService} from "../../../service/database.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TitlebarService} from "../../../service/titlebar.service";
import {MatDialog} from "@angular/material/dialog";
import {flatMap} from "rxjs/operators";
import {throwError} from "rxjs";
import {CreateGuestUserDialog} from "../admin-user-management/admin-user-management.component";
import {CreateUpdateSettingDialogComponent} from "./create-update-setting-dialog/create-update-setting-dialog.component";

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss']
})
export class AdminSettingsComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;
  columns = ['setting_key', 'setting_val', 'setting_typ', 'delete', 'edit'];
  parameterList: GlobalSetting[] = [];
  dataSource = new MatTableDataSource<GlobalSetting>();
  constructor(private db: DatabaseService, private snackBar: MatSnackBar, private titlebar: TitlebarService,
              private dialog: MatDialog) { }

  ngOnInit() {
    this.titlebar.emitTitle('Global Settings');
    this.loadSettingsList();
  }

  loadSettingsList(){
    // TODO from API

    let bla = {
      setting_key: "1",
      setting_val: "dsd",
      setting_typ: "INT"
    };

    this.parameterList.push(<GlobalSetting> bla);

    this.dataSource.data = this.parameterList;
    this.dataSource.sort = this.sort
  }
  deleteSetting(setting: GlobalSetting){

  }

  editSetting(setting: GlobalSetting){
    let emptyGlobalSetting = ({} as GlobalSetting)

    const dialogRef = this.dialog.open(CreateUpdateSettingDialogComponent, {
      width: '500px',
      data: setting
    });

    dialogRef.afterClosed()
      .subscribe((setting: GlobalSetting) => {
        console.warn(setting)
        // TODO update it
      })

  }
  showNewSettingsDialog(){
    let emptyGlobalSetting = ({} as GlobalSetting)

    const dialogRef = this.dialog.open(CreateUpdateSettingDialogComponent, {
      width: '500px',
      data: emptyGlobalSetting
    });

    dialogRef.afterClosed()
      .subscribe((setting: GlobalSetting) => {
        console.warn(setting)

        /*if (user) {
          this.db.createGuestUser(user.gUsername, user.gPassword, user.gRole, user.gPrename, user.gSurname, user.gEmail).pipe(
            flatMap(result => (result.success) ? this.db.getAllUsers() : throwError(result))
          ).subscribe(users => {
            this.snackBar.open('Gast Benutzer erstellt', null, {duration: 5000});
            this.dataSource.data = users;
            this.resetUserData();
          }, error => {
            this.snackBar.open('Error: ' + error.message, null, {duration: 5000});
          });
        }*/
      });


  }

}

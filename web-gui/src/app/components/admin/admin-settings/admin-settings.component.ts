import {Component, OnInit, ViewChild} from '@angular/core';
import {GlobalSetting, Succeeded} from "../../../interfaces/HttpInterfaces";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {DatabaseService} from "../../../service/database.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TitlebarService} from "../../../service/titlebar.service";
import {MatDialog} from "@angular/material/dialog";
import {CreateUpdateSettingDialogComponent} from "./create-update-setting-dialog/create-update-setting-dialog.component";
import {DeleteSettingDialogComponent} from "./delete-setting-dialog/delete-setting-dialog.component";

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
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.titlebar.emitTitle('Global Settings');
    this.loadSettingsList();
  }

  loadSettingsList() {
    this.db.getAllSettings().subscribe((settings: GlobalSetting[]) => {
      this.parameterList = settings;

      this.dataSource.data = this.parameterList;
      this.dataSource.sort = this.sort
    });
  }

  deleteSetting(setting: GlobalSetting) {
    this.dialog.open(DeleteSettingDialogComponent, {
      data: setting
    }).afterClosed().subscribe((answer: any) => {
      if(answer.exit) {
          this.handleDeleteSetting(setting)
        }
    })
  }

  handleDeleteSetting(setting: GlobalSetting) {
    this.db.deleteSetting(setting.setting_key).subscribe(
      (ok: Succeeded) => {
        if (ok) {
          this.loadSettingsList()
        } else {
          this.snackBar.open('Diese Einstellung konnte leider nicht gelöscht werden.', null, {duration: 5000});
        }
      },
      (error) => this.snackBar.open('Error: ' + error.message, null, {duration: 5000}));

  }

  editSetting(setting: GlobalSetting) {
    let emptyGlobalSetting = ({} as GlobalSetting);

    const dialogRef = this.dialog.open(CreateUpdateSettingDialogComponent, {
      width: '500px',
      data: setting
    });

    dialogRef.afterClosed()
      .subscribe((setting: GlobalSetting) => {
        this.db.updateSetting(setting.setting_key, setting.setting_val, setting.setting_typ).subscribe(
          (ok) => {
            if (ok.success) {
              this.snackBar.open('Das Update war erfolgreich', null, {duration: 5000});
              this.loadSettingsList()
            }
          }
          ,
          (error) => {
            this.snackBar.open('Error: ' + error.message, null, {duration: 5000});
            this.loadSettingsList()
          })
      })

  }

  showNewSettingsDialog() {
    let emptyGlobalSetting = ({} as GlobalSetting);

    const dialogRef = this.dialog.open(CreateUpdateSettingDialogComponent, {
      width: '500px',
      data: emptyGlobalSetting
    });

    dialogRef.afterClosed()
      .subscribe((setting: GlobalSetting) => {
        this.db.createNewSetting(setting.setting_key, setting.setting_val, setting.setting_typ).subscribe(
          (ok) => {
            if (ok.success) {
              this.snackBar.open('Neue Setting wurde erfolgreich erstellt', null, {duration: 5000});
              this.loadSettingsList()
            }
          },
          (error) => this.snackBar.open('Error: ' + error.message, null, {duration: 5000}));
      })
  }
}

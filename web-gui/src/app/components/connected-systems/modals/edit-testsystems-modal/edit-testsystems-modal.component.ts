import {Component, Inject, OnInit} from '@angular/core';
import {DatabaseService} from '../../../../service/database.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {GlobalSetting, Succeeded, TestsystemTestfile} from "../../../../interfaces/HttpInterfaces";
import {Testsystem} from "../../../../interfaces/HttpInterfaces";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-testsystems-modal.component.html',
  styleUrls: ['./edit-testsystems-modal.component.scss']
})
export class EditTestsystemsModalComponent implements OnInit {

  public id: string = '';
  public name: string = '';
  public description: string = '';
  public formats: string = '';
  public port: string = '';
  public ip: string = '';
  public settings: string[] = [];
  public testfiles: TestsystemTestfile[] = [];
  public accepted_input: number;

  settingsFormControl = new FormControl();
  settingsOptions: string[];

  dataSourcesSettingsKeys : string[];

  public modal_type: string = '';

  constructor(private db: DatabaseService, @Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<EditTestsystemsModalComponent>, private snackBar: MatSnackBar) {

  }

  ngOnInit() {

    this.initSettingsList();

    this.modal_type = this.data.type;

    let testsystem: Testsystem = this.data.testsystem;
    if(this.modal_type == 'edit'){
      this.id = testsystem.testsystem_id;
      this.name = testsystem.name;
      this.description = testsystem.description;
      this.formats = testsystem.supported_formats;
      this.port = testsystem.machine_port;
      this.ip = testsystem.machine_ip;
      this.settings = testsystem.settings;
      this.testfiles = testsystem.testfiles;
      this.accepted_input = testsystem.accepted_input;
      this.addEmptyTestfile();
    }
  }

  public deleteTestfile(index){
    this.testfiles.splice(index, 1);
  }

  private addEmptyTestfile(){
    this.testfiles.push({
      required: false,
      filename: ''
    })
  }

  smartFieldAdder(){
    let emptyFields = this.testfiles.filter((v: TestsystemTestfile) => v.filename.length === 0).length;
    if(emptyFields == 0){
      this.addEmptyTestfile()
    }
  }

  private generateBody(){
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      supported_formats: this.formats,
      machine_port: this.port,
      machine_ip: this.ip,
      settings: this.settings,
      accepted_input: this.accepted_input,
      testfiles: this.testfiles.filter((v: TestsystemTestfile) => v.filename !== null && v.filename.length > 0)
    }
  }

  createTestsystem(){
    this.db.postTestsystem(this.generateBody()).then((success: Succeeded) => {
      this.closeDialog(true);
    }).catch(() => {
      this.snackBar.open('Fehler', 'OK', {duration: 3000});
    })
  }

  updateTestsystem(){
    this.db.updateTestsystem(this.id,this.generateBody()).then( (success: Succeeded) => {
      if(success.success){
        this.closeDialog(true);
      } else {
        this.snackBar.open('Fehler', 'OK', {duration: 3000});

      }
    })
  }



  initSettingsList(){
    this.db.getAllSettings().subscribe((value => {
      this.dataSourcesSettingsKeys = value.map((v: GlobalSetting) => v.setting_key)
    }));


    this.settingsFormControl.valueChanges.subscribe((payload: string) => {
      this.settingsOptions = this.dataSourcesSettingsKeys.filter(setting => {
        return payload.length > 0 && setting.toLowerCase().indexOf(payload.toLowerCase()) > -1
      })
    })

  }

  /**
   * Add setting to list
   * @param key Keyboard press key 'ENTER'
   */
  addSetting(key: string) {
    if (key === 'Enter') {
      const selectedKey: string = this.settingsFormControl.value;
      this.settingsFormControl.setValue('');

      if(this.settings.indexOf(selectedKey) == -1)  this.settings.push(selectedKey)
    }

  }



  removeSetting(index: number) {
    this.settings.splice(index, 1);
  }




  /**
   * Close dialog without update
   */
  closeDialog(success: boolean) {
    this.dialogRef.close({success: success});
  }

}

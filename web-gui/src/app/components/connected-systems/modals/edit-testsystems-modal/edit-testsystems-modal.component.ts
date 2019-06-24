import {Component, Inject, OnInit} from '@angular/core';
import {DatabaseService} from '../../../../service/database.service';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {Succeeded} from "../../../../interfaces/HttpInterfaces";
import {Testsystem} from "../../../../interfaces/HttpInterfaces";

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
  
  public modal_type: string = '';

  constructor(private db: DatabaseService, @Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<EditTestsystemsModalComponent>, private snackBar: MatSnackBar) {

  }

  ngOnInit() {
    console.log(this.data.data);
    this.modal_type = this.data.type;

    let testsystem: Testsystem = this.data.testsystem;
    if(this.modal_type == 'edit'){
      this.id = testsystem.testsystem_id;
      this.name = testsystem.name;
      this.description = testsystem.description;
      this.formats = testsystem.supported_formats;
      this.port = testsystem.machine_port;
      this.ip = testsystem.machine_ip;
    }
  }

  private generateBody(){
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      supported_formats: this.formats,
      machine_port: this.port,
      machine_ip: this.ip
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


  /**
   * Close dialog without update
   */
  closeDialog(success: boolean) {
    this.dialogRef.close({success: success});
  }

}

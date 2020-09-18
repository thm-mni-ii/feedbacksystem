import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {DatabaseService} from "../../service/database.service";
import {TitlebarService} from "../../service/titlebar.service";
import {Succeeded, Testsystem} from "../../interfaces/HttpInterfaces";
import {EditTestsystemsModalComponent} from "./modals/edit-testsystems-modal/edit-testsystems-modal.component";
import {DeleteTestsystemAskModalComponent} from "./modals/delete-testsystem-ask-modal/delete-testsystem-ask-modal.component";

@Component({
  selector: 'app-connected-systems',
  templateUrl: './connected-systems.component.html',
  styleUrls: ['./connected-systems.component.scss']
})
export class ConnectedSystemsComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;

  constructor(private db: DatabaseService, private snackBar: MatSnackBar, private titlebar: TitlebarService,
              private dialog: MatDialog) {
  }

  columns = ['testsystem_id', 'name', 'description', 'supported_formats', 'machine_port', 'machine_ip', 'settings', 'testfiles', 'accepted_input', 'delete', 'edit'];
  dataSource = new MatTableDataSource<Testsystem>();

  ngOnInit() {
    this.loadAllTestsystem()
  }

  asFilename(testsystem: Testsystem){
      return testsystem.testfiles.map(v => v.filename)
  }
  openAddDialog(){
    this.dialog.open(EditTestsystemsModalComponent,{data:{
        type: 'new',
        data:{

        }
      }}).afterClosed().toPromise()
      .then(success => {
        if(success){
          this.loadAllTestsystem()
        }
      })
  }

  editTestsystem(testsystem: Testsystem){
    this.dialog.open(EditTestsystemsModalComponent,{data:{
        type: 'edit',
        testsystem:testsystem
      }}).afterClosed().toPromise()
      .then(success => {
        if(success){
          this.loadAllTestsystem()
        }
      })
  }

  deleteTestsystem(testsystem: Testsystem){
    this.dialog.open(DeleteTestsystemAskModalComponent, {data:{name: testsystem.name}}).afterClosed().toPromise()
      .then((success: Succeeded) => {
        if(success.success){
          this.db.deleteTestsystem(testsystem.testsystem_id).then((success: Succeeded) => {
            if(success){
              this.loadAllTestsystem()
            }
          })
        }
      })

  }

  loadAllTestsystem(){
    this.db.getTestsystemTypes().toPromise()
      .then((systems: Testsystem[]) => {
        this.dataSource.data = systems;
        this.dataSource.sort = this.sort;
      })
  }

  /**
   * Admin searches for user
   * @param filterValue String the admin provides to search for
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}

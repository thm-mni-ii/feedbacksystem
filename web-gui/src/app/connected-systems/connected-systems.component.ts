import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {Testsystem, User} from "../interfaces/HttpInterfaces";
import {DatabaseService} from "../service/database.service";
import {TitlebarService} from "../service/titlebar.service";

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

  columns = ['testsystem_id', 'name', 'description', 'supported_formats', 'machine_port', 'machine_ip'];
  dataSource = new MatTableDataSource<Testsystem>();

  ngOnInit() {
    this.loadAllTestsystem()
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

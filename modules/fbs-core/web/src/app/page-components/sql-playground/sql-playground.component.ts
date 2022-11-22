import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Routine } from "src/app/model/sql_playground/Routine";
import { Trigger } from "src/app/model/sql_playground/Trigger";
import { View } from "src/app/model/sql_playground/View";
import { TitlebarService } from "../../service/titlebar.service";
import { AuthService } from "src/app/service/auth.service";
import { SqlPlaygroundService } from "src/app/service/sql-playground.service";
import { Table } from "src/app/model/sql_playground/Table";
import { Constraint } from "src/app/model/sql_playground/Constraint";

/**
 * This component is for the sql playground
 */
@Component({
  selector: "app-sql-playground-management",
  templateUrl: "./sql-playground.component.html",
  styleUrls: ["./sql-playground.component.scss"],
})
export class SqlPlaygroundComponent implements OnInit {
  constructor(
    private titlebar: TitlebarService,
    private authService: AuthService,
    private sqlPlaygroundService: SqlPlaygroundService
  ) {}

  activeDb: number;
  resultset: any;

  triggers: Trigger[];
  routines: Routine[];
  views: View[];
  tables: Table[];
  constraints: Constraint[];
  isQueryPending: boolean = false;

  ngOnInit() {
    this.titlebar.emitTitle("SQL Playground");
  }

  changeActiveDb($event) {
    this.activeDb = $event;
    this.updateScheme();
  }

  changeResultset($event) {
    this.resultset = $event;
    this.updateScheme();
  }

  changeQueryPending($event) {
    this.isQueryPending = $event;
  }

  updateScheme() {
    const token = this.authService.getToken();

    this.sqlPlaygroundService
      .getTables(token.id, this.activeDb)
      .subscribe((result) => {
        this.tables = result;
      });

    this.sqlPlaygroundService
      .getConstraints(token.id, this.activeDb)
      .subscribe((result) => {
        this.constraints = result;
      });

    this.sqlPlaygroundService
      .getViews(token.id, this.activeDb)
      .subscribe((result) => {
        this.views = result;
        console.log(this.views);
        
      });

    this.sqlPlaygroundService
      .getRoutines(token.id, this.activeDb)
      .subscribe((result) => {
        this.routines = result;
        console.log(this.routines);
        
      });

    this.sqlPlaygroundService
      .getTriggers(token.id, this.activeDb)
      .subscribe((result) => {
        this.triggers = result;
        console.log(this.triggers);
        
      });
  }
}

import { Component, OnInit } from "@angular/core";
import { Routine } from "src/app/model/sql_playground/Routine";
import { Trigger } from "src/app/model/sql_playground/Trigger";
import { View } from "src/app/model/sql_playground/View";
import { TitlebarService } from "../../service/titlebar.service";
import { AuthService } from "src/app/service/auth.service";
import { SqlPlaygroundService } from "src/app/service/sql-playground.service";
import { Table } from "src/app/model/sql_playground/Table";
import { Constraint } from "src/app/model/sql_playground/Constraint";
import { delay, retryWhen } from "rxjs/operators";
import { MatSnackBar } from "@angular/material/snack-bar";

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
    private snackbar: MatSnackBar,
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

  changeActiveDbId(dbId: number) {
    this.activeDb = dbId;
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
      });

    this.sqlPlaygroundService
      .getRoutines(token.id, this.activeDb)
      .subscribe((result) => {
        this.routines = result;
      });

    this.sqlPlaygroundService
      .getTriggers(token.id, this.activeDb)
      .subscribe((result) => {
        this.triggers = result;
      });
  }

  submitStatement(statement: string) {
    this.isQueryPending = true;
    const token = this.authService.getToken();

    this.sqlPlaygroundService
      .submitStatement(token.id, this.activeDb, statement)
      .subscribe(
        (result) => {
          this.getResultsbyPolling(result.id);
        },
        (error) => {
          console.error(error);
          this.snackbar.open(
            "Beim Versenden ist ein Fehler aufgetreten. Versuche es später erneut.",
            "OK",
            { duration: 3000 }
          );
          this.isQueryPending = false;
        }
      );
  }

  private getResultsbyPolling(rId: number) {
    const token = this.authService.getToken();

    this.sqlPlaygroundService
      .getResults(token.id, this.activeDb, rId)
      .pipe(
        retryWhen((err) => {
          return err.pipe(delay(1000));
        })
      )
      .subscribe(
        (res) => {
          // emit if success
          this.isQueryPending = false;
          this.resultset = res;
          this.updateScheme();
        },
        () => {}, //handle error
        () => console.log("Request Complete")
      );
  }
}

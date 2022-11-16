import { Component, OnInit } from "@angular/core";
import { Database } from "../../../model/sql_playground/Database";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/service/auth.service";
import { SqlPlaygroundService } from "src/app/service/sql-playground.service";
import { JWTToken } from "src/app/model/JWTToken";

@Component({
  selector: "app-db-control-panel",
  templateUrl: "./db-control-panel.component.html",
  styleUrls: ["./db-control-panel.component.scss"],
})
export class DbControlPanelComponent implements OnInit {
  constructor(
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private sqlPlaygroundService: SqlPlaygroundService
  ) {}

  dbs: Database[];
  activeDb: Database = this.getActiveDb();
  selectedDb: Number = this.activeDb.id;
  token: JWTToken = this.authService.getToken();

  ngOnInit(): void {
    this.sqlPlaygroundService.getDatabases(this.token.id).subscribe(
      (data) => {
        this.dbs = data;
      },
      (error) => {
        console.log(error);
        this.snackbar.open("Fehler beim Laden der Datenbanken", "Ok", {
          duration: 3000,
        });
      }
    );
  }

  getActiveDb(): Database {
    return this.dbs.find((db) => db.active);
  }
}

import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { Database } from "../../../../model/sql_playground/Database";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/service/auth.service";
import { MatDialog } from "@angular/material/dialog";
import { TextConfirmDialogComponent } from "../../../../dialogs/text-confirm-dialog/text-confirm-dialog.component";
import { NewDbDialogComponent } from "../../../../dialogs/new-db-dialog/new-db-dialog.component";
import {
  loadDatabases,
  createDatabase,
  deleteDatabase,
  activateDatabase,
} from "src/app/page-components/sql-playground/db-control-panel/state/databases.actions";
import {
  selectAllDatabases,
  selectDatabasesError,
} from "src/app/page-components/sql-playground/db-control-panel/state/databases.selectors";
import { setBackend } from "../../state/sql-playground.actions";

@Component({
  selector: "app-db-control-co-working",
  templateUrl: "./db-control-co-working.component.html",
  styleUrls: ["./db-control-co-working.component.scss"],
})
export class DbControlCoWorkingComponent implements OnInit {
  databases$: Observable<Database[]>;
  error$: Observable<any>;
  selectedDb: number = 0;
  token = this.authService.getToken();
  pending: boolean = false;
  groupCode: string = "";
  selectedDatabase: string;

  selectedDbGroup: number = 0;
  groups: any[] = [
    { id: 0, name: "Gruppe 1" },
    { id: 1, name: "Gruppe 2" },
  ];

  collaborativeMode: boolean = false;

  constructor(
    private store: Store,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadDatabases());
    this.databases$ = this.store.select(selectAllDatabases);
    this.error$ = this.store.select(selectDatabasesError);
  }

  createDatabase(name: string) {
    this.store.dispatch(createDatabase({ name }));
  }

  deleteDatabase() {
    const selectedDb = this.selectedDb;
    const dialogRef = this.dialog.open(TextConfirmDialogComponent, {
      data: {
        title: "Datenbank löschen",
        message: "Möchten Sie die Datenbank wirklich löschen?",
        textToRepeat: `${selectedDb}`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(deleteDatabase({ id: selectedDb }));
      }
    });
  }

  activateDatabase(id: number) {
    this.store.dispatch(activateDatabase({ id }));
  }

  changeCollaborativeMode() {
    this.store.dispatch(
      setBackend({ backend: { type: "collaborative", id: this.groupCode } })
    );
    this.collaborativeMode = true;
  }

  addDb() {
    this.dialog
      .open(NewDbDialogComponent, {
        height: "auto",
        width: "50%",
        data: { token: this.token },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res.success) {
          this.snackbar.open("Datenbank erfolgreich erstellt", "Ok", {
            duration: 3000,
          });
        } else {
          this.snackbar.open("Fehler beim Erstellen der Datenbank", "Ok", {
            duration: 3000,
          });
        }
      });
  }

  activateGroup(groupId: number) {
    console.log(groupId);
    throw new Error("Method not implemented.");
  }
}

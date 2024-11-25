import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { Database } from "../../../../model/sql_playground/Database";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/service/auth.service";
import { MatDialog } from "@angular/material/dialog";
import { TextConfirmDialogComponent } from "../../../../dialogs/text-confirm-dialog/text-confirm-dialog.component";
import { NewDbDialogComponent } from "../../../../dialogs/new-db-dialog/new-db-dialog.component";
import { SharePlaygroundLinkDialogComponent } from "src/app/dialogs/share-playground-link-dialog/share-playground-link-dialog.component";
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
import { SqlPlaygroundService } from "../../../../service/sql-playground.service";

@Component({
  selector: "app-db-control-db-overview",
  templateUrl: "./db-control-db-overview.component.html",
  styleUrls: ["./db-control-db-overview.component.scss"],
})
export class DbControlDbOverviewComponent implements OnInit {
  databases$: Observable<Database[]>;
  error$: Observable<any>;
  selectedDb: number = 0;
  token = this.authService.getToken();
  pending: boolean = false;

  activeDb$: Observable<Database[]>;
  collaborativeMode: boolean = false;

  constructor(
    private store: Store,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog,
    private playgroundService: SqlPlaygroundService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadDatabases());
    this.databases$ = this.store.select(selectAllDatabases);
    this.error$ = this.store.select(selectDatabasesError);
    this.activeDb$ = this.store.select(selectAllDatabases);
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
    this.collaborativeMode = !this.collaborativeMode;
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

  getTempURI() {
    this.databases$.subscribe((databases) => {
      const selectedDb = databases.find((db) => db.id === this.selectedDb);
      if (selectedDb) {
        this.playgroundService
          .getSharePlaygroundURI(this.token.id, selectedDb.id)
          .subscribe((share) => {
            this.dialog.open(SharePlaygroundLinkDialogComponent, {
              height: "auto",
              width: "50%",
              autoFocus: false,
              data: {
                message: `Der URI-Link zu deiner Datenbank \"${selectedDb.name}\" ist nur für 24 Stunden verfügbar!\n`,
                uri: share.url,
              },
            });
          });
      }
    });
  }
}

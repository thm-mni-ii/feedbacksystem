import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { Database } from "../../../../model/sql_playground/Database";
import { MatSnackBar as MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/service/auth.service";
import { MatDialog as MatDialog } from "@angular/material/dialog";
import { TextConfirmDialogComponent } from "../../../../dialogs/text-confirm-dialog/text-confirm-dialog.component";
import { NewDbDialogComponent } from "../../../../dialogs/new-db-dialog/new-db-dialog.component";
import { SharePlaygroundLinkDialogComponent } from "src/app/dialogs/share-playground-link-dialog/share-playground-link-dialog.component";
import {
  loadDatabases,
  createDatabase,
  deleteDatabase,
  activateDatabase,
  resetMongoDatabase,
} from "src/app/page-components/sql-playground/db-control-panel/state/databases.actions";
import {
  selectDatabasesForCurrentType,
  selectDatabasesError,
} from "src/app/page-components/sql-playground/db-control-panel/state/databases.selectors";
import { SqlPlaygroundService } from "../../../../service/sql-playground.service";
import { map, take } from "rxjs/operators";
import {
  BackendDefintion,
  DatabaseInformation,
} from "../../collab/backend.service";
import {
  selectBackend,
  selectBackendDatabaseInformation,
} from "../../state/sql-playground.selectors";

@Component({
  standalone: false,
  selector: "app-db-control-db-overview",
  templateUrl: "./db-control-db-overview.component.html",
  styleUrls: ["./db-control-db-overview.component.scss"],
})
export class DbControlDbOverviewComponent implements OnInit {
  @Input() selectedMongoDbId: string | null = null;
  @Output() mongoDbSelected = new EventEmitter<string>();
  @Output() schemaReload = new EventEmitter<void>();

  databases$: Observable<Database[]>;
  error$: Observable<any>;
  token = this.authService.getToken();
  pending: boolean = false;
  activeDb$: Observable<Database>;
  collaborativeMode: boolean = false;
  backend$: Observable<BackendDefintion>;
  backend: BackendDefintion;
  backendDatabaseInformation$: Observable<DatabaseInformation>;
  databaseInformation: DatabaseInformation;
  selectedDbType: "postgres" | "mongo" | null = null;
  selectedDb: number | string = "";

  constructor(
    private store: Store,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog,
    private playgroundService: SqlPlaygroundService
  ) {}

  onDbTypeChange(type: "postgres" | "mongo") {
    this.selectedDbType = type;
    localStorage.setItem("playground-db-type", type);
    location.reload();
  }

  ngOnInit(): void {
    const storedDbType = localStorage.getItem("playground-db-type") as
      | "postgres"
      | "mongo"
      | null;
    const dbType = storedDbType || "postgres";
    this.selectedDbType = dbType;
    if (!storedDbType) {
      localStorage.setItem("playground-db-type", "postgres");
    }

    // Always initialise databases$ so downstream .pipe() calls never crash.
    this.databases$ = this.store.select(selectDatabasesForCurrentType);

    this.store.dispatch(loadDatabases({ dbType }));

    this.error$ = this.store.select(selectDatabasesError);
    this.backendDatabaseInformation$ = this.store.select(
      selectBackendDatabaseInformation
    );
    this.backendDatabaseInformation$.subscribe((databaseInformation) => {
      this.databaseInformation = databaseInformation;
    });

    this.backend$ = this.store.select(selectBackend);
    this.backend$.subscribe((backend) => {
      this.backend = backend;
    });

    this.activeDb$ = this.databases$.pipe(
      map((databases) => databases.find((database) => database.active))
    );
    this.activeDb$.subscribe((activeDb) => {
      if (activeDb) {
        this.selectedDb = activeDb.id;
      }
    });

    this.authService.tokenReceived$.subscribe((received) => {
      if (received) {
        this.token = this.authService.getToken();
        this.store.dispatch(loadDatabases({ dbType: this.selectedDbType || "postgres" }));
      }
    });
  }

  createDatabase(name: string) {
    const dbType = this.selectedDbType || "postgres";
    this.store.dispatch(createDatabase({ name, dbType }));
  }

  getShortName(fullName: string): string {
    return fullName.replace(/^mongo_playground_student_\d+_/, "");
  }

  deleteDatabase() {
    const selectedDb = this.selectedDb;
    if (!selectedDb) {
      this.snackbar.open("Keine Datenbank zum Löschen ausgewählt", "Ok", {
        duration: 3000,
      });
      return;
    }
    const dialogRef = this.dialog.open(TextConfirmDialogComponent, {
      panelClass: "sql-playground-delete-confirm-dialog",
      data: {
        title: "Datenbank löschen",
        message: "Möchten Sie die Datenbank wirklich löschen?",
        textToRepeat: this.getShortName(this.selectedDb.toString()),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const dbType = this.selectedDbType || "postgres";
      this.store.dispatch(deleteDatabase({ id: selectedDb, dbType }));

      // Reload after deletion to refresh the list
      setTimeout(() => {
        this.store.dispatch(loadDatabases({ dbType }));
      }, 500);
    });
  }

  activateDatabase(id: number | string) {
    this.selectedDb = id;
    const dbType = this.selectedDbType || "postgres";

    this.store.dispatch(activateDatabase({ id, dbType }));

    if (dbType === "mongo") {
      this.mongoDbSelected.emit(id.toString());
      this.schemaReload.emit();
    }
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
        if (!res || !res.success) return;

        if (!res.name) {
          this.snackbar.open("Fehler beim Erstellen der Datenbank", "Ok", {
            duration: 3000,
          });
          console.warn("Dialog-Response ungültig:", res);
          return;
        }

        const dbType = this.selectedDbType || "postgres";
        this.store.dispatch(createDatabase({ name: res.name, dbType }));

        // Reload after creation to refresh the list
        setTimeout(() => {
          this.store.dispatch(loadDatabases({ dbType }));
        }, 500);
      });
  }

  resetMongoDatabase() {
    if (!this.selectedDb) {
      this.snackbar.open("Keine MongoDB zum Zurücksetzen ausgewählt", "Ok", {
        duration: 3000,
      });
      return;
    }
    const dialogRef = this.dialog.open(TextConfirmDialogComponent, {
      panelClass: "sql-playground-delete-confirm-dialog",
      data: {
        title: "Datenbank resetten",
        message: "Möchten Sie wirklich alle Inhalte dieser MongoDB löschen?",
        textToRepeat: this.getShortName(this.selectedDb.toString()),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.store.dispatch(
        resetMongoDatabase({ id: this.selectedDb.toString() })
      );

      // Reload schema after reset
      setTimeout(() => {
        this.schemaReload.emit();
      }, 500);
    });
  }

  getTempURI() {
    // Temporary URI sharing is only available for PostgreSQL databases
    if (this.selectedDbType !== "postgres") {
      this.snackbar.open(
        "URI-Freigabe ist nur für PostgreSQL-Datenbanken verfügbar",
        "Ok",
        { duration: 3000 }
      );
      return;
    }

    this.databases$.pipe(take(1)).subscribe((databases) => {
      const selectedDb = databases.find((db) => db.id === this.selectedDb);
      const uid = this.token?.id || this.authService.getToken()?.id;
      if (selectedDb && uid && selectedDb.id) {
        this.playgroundService
          .getSharePlaygroundURI(uid, selectedDb.id as number)
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

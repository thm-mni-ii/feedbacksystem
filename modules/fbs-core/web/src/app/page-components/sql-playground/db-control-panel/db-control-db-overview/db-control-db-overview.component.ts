import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable } from "rxjs";
import { Database } from "../../../../model/sql_playground/Database";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/service/auth.service";
import { SqlPlaygroundService } from "src/app/service/sql-playground.service";
import { JWTToken } from "src/app/model/JWTToken";
import { TextConfirmDialogComponent } from "../../../../dialogs/text-confirm-dialog/text-confirm-dialog.component";
import { NewDbDialogComponent } from "../../../../dialogs/new-db-dialog/new-db-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { SharePlaygroundLinkDialogComponent } from "src/app/dialogs/share-playground-link-dialog/share-playground-link-dialog.component";

@Component({
  selector: "app-db-control-db-overview",
  templateUrl: "./db-control-db-overview.component.html",
  styleUrls: ["./db-control-db-overview.component.scss"],
})
export class DbControlDbOverviewComponent implements OnInit {
  @Input() collaborativeMode: boolean;
  @Output() collaborativeModeChange = new EventEmitter<boolean>();
  @Output() changeActiveDb = new EventEmitter<Database>();

  constructor(
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private sqlPlaygroundService: SqlPlaygroundService,
    private dialog: MatDialog
  ) {}

  dbs: Database[] = [];
  activeDb: Database;
  selectedDb: number = 0;
  token: JWTToken = this.authService.getToken();
  pending: boolean = false;

  ngOnInit(): void {
    this.sqlPlaygroundService.getDatabases(this.token.id).subscribe(
      (data) => {
        this.dbs = data;

        if (this.dbs.length == 0) {
          // create default database if none exists
          this.createDatabase("Standard Datenbank").subscribe((result) => {
            if (result != null) {
              this.activeDb = this.getActiveDb(this.dbs);
              this.selectedDb = this.activeDb.id;
            }
          });
        } else if (this.getActiveDb(this.dbs) == null) {
          this.activeDb = this.dbs[0];
          this.selectedDb = this.activeDb.id;
          this.activateDb(this.selectedDb);
        } else {
          this.activeDb = this.getActiveDb(this.dbs);
          this.selectedDb = this.activeDb.id;
        }
        this.changeActiveDb.emit(this.activeDb);
      },
      (error) => {
        console.log(error);
        this.snackbar.open("Fehler beim Laden der Datenbanken", "Ok", {
          duration: 3000,
        });
      }
    );
  }

  changeCollaborativeMode() {
    this.collaborativeModeChange.emit(!this.collaborativeMode);
  }

  getActiveDb(dbs: Database[]): Database {
    const activeDB = dbs.find((db) => db.active == true);
    if (activeDB !== undefined) {
      return activeDB;
    } else {
      return null;
    }
  }

  isSelectDbActive(): boolean {
    if (this.activeDb !== undefined) {
      return this.selectedDb == this.activeDb.id;
    } else {
      return false;
    }
  }

  createDatabase(name: string): Observable<Database> {
    this.sqlPlaygroundService.createDatabase(this.token.id, name).subscribe(
      (data) => {
        this.snackbar.open("Datenbank erfolgreich erstellt", "Ok", {
          duration: 3000,
        });
        this.ngOnInit();
        return data;
      },
      (error) => {
        console.log(error);
        this.snackbar.open("Fehler beim Erstellen der Datenbank", "Ok", {
          duration: 3000,
        });
      }
    );
    return null;
  }

  deleteDatabase() {
    const selectedDb = this.dbs.find((db) => db.id == this.selectedDb);

    this.openTextConfirmDialog(
      "Datenbank löschen",
      "Möchten Sie die Datenbank wirklich löschen?",
      `${selectedDb.name}`
    ).subscribe((result) => {
      if (result === true) {
        this.sqlPlaygroundService
          .deleteDatabase(this.token.id, selectedDb.id)
          .subscribe(
            () => {
              this.snackbar.open(
                `Datenbank ${selectedDb.name} erfolgreich gelöscht`,
                "Ok",
                {
                  duration: 3000,
                }
              );
              this.ngOnInit();
            },
            (error) => {
              console.log(error);
              this.snackbar.open("Fehler beim Löschen der Datenbank", "Ok", {
                duration: 3000,
              });
            }
          );
      }
    });
  }

  activateDb(dbId: number) {
    this.pending = true;
    const selectedDb = this.dbs.find((db) => db.id == dbId);

    this.sqlPlaygroundService
      .activateDatabase(this.token.id, selectedDb.id)
      .subscribe(
        () => {
          this.snackbar.open(
            `Datenbank ${selectedDb.name} erfolgreich aktiviert`,
            "Ok",
            {
              duration: 3000,
            }
          );
          this.ngOnInit();
          this.pending = false;
        },
        (error) => {
          console.log(error);
          this.snackbar.open("Fehler beim Aktivieren der Datenbank", "Ok", {
            duration: 3000,
          });
          this.pending = false;
        }
      );
  }

  private openTextConfirmDialog(
    title: string,
    message: string,
    textToRepeat: string
  ) {
    const dialogRef = this.dialog.open(TextConfirmDialogComponent, {
      data: {
        title: title,
        message: message,
        textToRepeat: textToRepeat,
      },
    });
    return dialogRef.afterClosed();
  }

  getTempURI() {
    const selectedDb = this.dbs.find((db) => db.id == this.selectedDb);
    this.sqlPlaygroundService
      .getSharePlaygroundURI(this.token.id, selectedDb.id)
      .subscribe((share) => {
        this.dialog.open(SharePlaygroundLinkDialogComponent, {
          height: "auto",
          width: "50%",
          autoFocus: false,
          data: {
            message: `Der URI-Link zu deiner Datenbank \" ${selectedDb.name} \" ist nur für 24 Stunden verfügbar!\n`,
            uri: share.url,
          },
        });
      });
  }

  addDb() {
    this.dialog
      .open(NewDbDialogComponent, {
        height: "auto",
        width: "50%",
        data: {
          token: this.token,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res.success) {
          this.ngOnInit();
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

  genData() {
    
  }
}

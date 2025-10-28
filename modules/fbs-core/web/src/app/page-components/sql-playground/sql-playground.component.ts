import { AfterViewChecked, Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Subject, BehaviorSubject, Observable } from "rxjs";
import { Routine } from "src/app/model/sql_playground/Routine";
import { Trigger } from "src/app/model/sql_playground/Trigger";
import { View } from "src/app/model/sql_playground/View";
import { Table } from "src/app/model/sql_playground/Table";
import { Constraint } from "src/app/model/sql_playground/Constraint";
import { TitlebarService } from "../../service/titlebar.service";
import { AuthService } from "src/app/service/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import * as SqlPlaygroundActions from "./state/sql-playground.actions";
import * as fromSqlPlayground from "./state/sql-playground.selectors";
import * as TemplateActions from "./db-control-panel/state/templates.actions";
import { BackendService } from "./collab/backend.service";
import { HttpClient } from "@angular/common/http";
import { MongoPlaygroundService } from "src/app/service/mongo-playground.service";

import Prism from "prismjs";
import "prismjs/components/prism-json";

@Component({
  selector: "app-sql-playground-management",
  templateUrl: "./sql-playground.component.html",
  styleUrls: ["./sql-playground.component.scss"],
})
export class SqlPlaygroundComponent implements OnInit, AfterViewChecked {
  activeDb$: Observable<number>;
  resultset$: Observable<any>;
  triggers$: Observable<Trigger[]>;
  routines$: Observable<Routine[]>;
  views$: Observable<View[]>;
  tables$: Observable<Table[]>;
  constraints$: Observable<Constraint[]>;
  isQueryPending$: Observable<boolean>;
  selectedDbType: "postgres" | "mongo" = "postgres";
  mongoDbId: string | null = null;
  schemaReload$ = new Subject<void>();
  mongoRawResult$ = new BehaviorSubject<any>(null);

  constructor(
    private titlebar: TitlebarService,
    private authService: AuthService,
    private backendService: BackendService,
    private snackbar: MatSnackBar,
    private store: Store,
    private http: HttpClient,
    private mongoPlaygroundService: MongoPlaygroundService
  ) {}

  ngOnInit() {
    const savedDbType = localStorage.getItem("playground-db-type") as
      | "postgres"
      | "mongo";
    this.selectedDbType = savedDbType ?? "postgres";
    this.store.dispatch(
      TemplateActions.setFilterLanguage({ filterLanguage: this.selectedDbType })
    );
    this.titlebar.emitTitle("SQL Playground");

    const fullDbName = localStorage.getItem("playground-mongo-db-full");
    if (fullDbName) this.mongoDbId = this.getDbSuffix(fullDbName);

    this.activeDb$ = this.store.select(fromSqlPlayground.selectActiveDb);
    this.resultset$ = this.store.select(fromSqlPlayground.selectResultset);
    this.triggers$ = this.store.select(fromSqlPlayground.selectTriggers);
    this.routines$ = this.store.select(fromSqlPlayground.selectRoutines);
    this.views$ = this.store.select(fromSqlPlayground.selectViews);
    this.tables$ = this.store.select(fromSqlPlayground.selectTables);
    this.constraints$ = this.store.select(fromSqlPlayground.selectConstraints);
    this.isQueryPending$ = this.store.select(
      fromSqlPlayground.selectIsQueryPending
    );
    this.backendService.setupBackendHandler();

    if (this.selectedDbType === "mongo") {
      const userId = this.authService.getToken().id;
      this.http
        .get<string[]>(`/api/v2/playground/${userId}/databases/mongo/list`)
        .subscribe((dbs) => {
          if (!this.mongoDbId && dbs.length > 0) {
            const fallbackFull = dbs[0];
            const fallbackSuffix = this.getDbSuffix(fallbackFull);

            this.mongoDbId = fallbackSuffix;
            localStorage.setItem("playground-mongo-db-full", fallbackFull);
            localStorage.setItem("playground-mongo-db", fallbackSuffix);
          }
        });
    }
  }

  private getDbSuffix(fullName: string): string {
    const userId = this.authService.getToken().id;
    const prefix = `mongo_playground_student_${userId}_`;
    return fullName.startsWith(prefix)
      ? fullName.replace(prefix, "")
      : fullName;
  }

  changeActiveDbId(dbId: number) {
    this.store.dispatch(SqlPlaygroundActions.changeActiveDbId({ dbId }));
    this.updateScheme();
  }

  changeQueryPending() {
    this.store.dispatch(SqlPlaygroundActions.updateScheme());
  }

  updateScheme() {
    this.store.dispatch(SqlPlaygroundActions.updateScheme());
  }

  submitStatement(statement: string) {
    if (this.selectedDbType === "postgres") {
      this.store.dispatch(SqlPlaygroundActions.submitStatement({ statement }));
      return;
    }

    const userId = this.authService.getToken().id;
    const dbId = this.mongoDbId;

    if (!dbId) {
      this.snackbar.open("Keine Mongo-Datenbank ausgewählt", "Fehler", {
        duration: 3000,
      });
      return;
    }

    this.mongoRawResult$.next(null);

    try {
      const parsedQuery = JSON.parse(statement);

      this.mongoPlaygroundService
        .executeMongoQuery(userId, dbId, parsedQuery)
        .subscribe({
          next: (res) => {
            this.mongoRawResult$.next(res);

            if (
              parsedQuery.operation !== "find" &&
              parsedQuery.operation !== "aggregate"
            )
              this.snackbar.open("MongoDB-Operation erfolgreich", "Ok", {
                duration: 3000,
              });

            this.schemaReload$.next();
          },
          error: (err) => {
            this.snackbar.open(
              "MongoDB-Fehler: " +
                (err.error?.message ?? "Ausführung nicht möglich"),
              "Fehler",
              { duration: 3000 }
            );
          },
        });
    } catch {
      this.mongoRawResult$.next(null);

      this.mongoPlaygroundService
        .executeMongoShellCommand(userId, dbId, statement)
        .subscribe({
          next: (res) => {
            this.mongoRawResult$.next(res);
            this.schemaReload$.next();
            this.snackbar.open("MongoShell erfolgreich ausgeführt", "", {
              duration: 2500,
            });
          },
          error: (err) => {
            this.snackbar.open(
              "MongoDB-Fehler: " +
                (err.error?.message ?? "Ausführung nicht möglich"),
              "Fehler",
              { duration: 3000 }
            );
          },
        });
    }
  }

  onDbChanged(dbType: "postgres" | "mongo") {
    this.selectedDbType = dbType;
    localStorage.setItem("playground-db-type", dbType);

    if (dbType === "postgres") this.mongoDbId = null;

    this.schemaReload$.next();
    this.store.dispatch(
      TemplateActions.setFilterLanguage({ filterLanguage: dbType })
    );
  }

  onMongoDbSelected(fullDbName: string) {
    const userId = this.authService.getToken().id;
    const prefix = `mongo_playground_student_${userId}_`;
    const suffix = fullDbName.startsWith(prefix)
      ? fullDbName.replace(prefix, "")
      : fullDbName;

    this.mongoDbId = suffix;
    localStorage.setItem("playground-mongo-db-full", fullDbName);
    localStorage.setItem("playground-mongo-db", suffix);

    setTimeout(() => {
      this.schemaReload$.next();
    }, 0);
  }

  ngAfterViewChecked() {
    if (this.selectedDbType === "mongo") {
      Prism.highlightAll();
    }
  }
}

import { AfterViewChecked, Component, OnDestroy, OnInit } from "@angular/core";
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
import { MongoPlaygroundService } from "src/app/service/mongo-playground.service";
import { ActivatedRoute } from "@angular/router";
import { PlaygroundContextService } from "src/app/service/playground-context.service";

import Prism from "prismjs";
import "prismjs/components/prism-json";

@Component({
  selector: "app-sql-playground-management",
  templateUrl: "./sql-playground.component.html",
  styleUrls: ["./sql-playground.component.scss"],
})
export class SqlPlaygroundComponent
  implements OnInit, AfterViewChecked, OnDestroy
{
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
  readOnly: boolean = false;
  readOnlyOwnerName: string | null = null;

  constructor(
    private titlebar: TitlebarService,
    private authService: AuthService,
    private backendService: BackendService,
    private snackbar: MatSnackBar,
    private store: Store,
    private mongoPlaygroundService: MongoPlaygroundService,
    private route: ActivatedRoute,
    private playgroundContext: PlaygroundContextService
  ) {}

  ngOnInit() {
    const currentUserId = this.authService.getToken().id;
    const requestedUserIdParam =
      this.route.snapshot.queryParamMap.get("viewUserId");
    const courseIdParam = this.route.snapshot.queryParamMap.get("courseId");
    const requestedUserId = requestedUserIdParam
      ? Number(requestedUserIdParam)
      : Number.NaN;
    const courseId = courseIdParam ? Number(courseIdParam) : Number.NaN;
    const readOnlyRequested =
      this.route.snapshot.queryParamMap.get("readOnly") === "true";

    if (
      readOnlyRequested &&
      Number.isFinite(requestedUserId) &&
      Number.isFinite(courseId) &&
      requestedUserId !== currentUserId
    ) {
      this.playgroundContext.setContext({
        userId: requestedUserId,
        readOnly: true,
        courseId,
        ownerName: this.route.snapshot.queryParamMap.get("studentName"),
      });
    } else {
      this.playgroundContext.reset();
    }

    this.readOnly = this.playgroundContext.isReadOnly();
    this.readOnlyOwnerName = this.playgroundContext.ownerName;

    const shouldOpenCoWorking = this.isCoWorkingTab(
      this.route.snapshot.queryParamMap.get("controlTab")
    );
    const savedDbType = (
      shouldOpenCoWorking
        ? "postgres"
        : localStorage.getItem("playground-db-type") || "postgres"
    ) as "postgres" | "mongo";
    this.selectedDbType = savedDbType ?? "postgres";
    if (shouldOpenCoWorking && !this.readOnly) {
      localStorage.setItem("playground-db-type", "postgres");
    }
    this.store.dispatch(
      TemplateActions.setFilterLanguage({ filterLanguage: this.selectedDbType })
    );
    this.titlebar.emitTitle(
      this.readOnly ? "SQL Playground (Nur-Lese-Modus)" : "SQL Playground"
    );

    const fullDbName = this.readOnly
      ? null
      : localStorage.getItem("playground-mongo-db-full");
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
    this.backendService.setupBackendHandler(this.readOnly);

    if (this.selectedDbType === "mongo") {
      const userId = this.playgroundContext.userId;
      this.mongoPlaygroundService
        .getMongoDatabases(userId, this.playgroundContext.courseId)
        .subscribe((dbs) => {
          if (!this.mongoDbId && dbs.length > 0) {
            const fallbackFull = dbs[0];
            const fallbackSuffix = this.getDbSuffix(fallbackFull);

            this.mongoDbId = fallbackSuffix;
            if (!this.readOnly) {
              localStorage.setItem("playground-mongo-db-full", fallbackFull);
              localStorage.setItem("playground-mongo-db", fallbackSuffix);
            }
          }
        });
    }
  }

  private getDbSuffix(fullName: string): string {
    const userId = this.playgroundContext.userId;
    const prefix = `mongo_playground_student_${userId}_`;
    return fullName.startsWith(prefix)
      ? fullName.replace(prefix, "")
      : fullName;
  }

  private isCoWorkingTab(tab: string | null): boolean {
    return tab === "co-working" || tab === "coworking";
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
    if (this.readOnly) {
      this.snackbar.open("Abfragen sind im Nur-Lese-Modus deaktiviert", "Ok", {
        duration: 3000,
      });
      return;
    }

    if (this.selectedDbType === "postgres") {
      this.store.dispatch(SqlPlaygroundActions.submitStatement({ statement }));
      return;
    }

    const userId = this.playgroundContext.userId;
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
        .executeMongoQuery(
          userId,
          dbId,
          parsedQuery,
          this.playgroundContext.courseId
        )
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
        .executeMongoShellCommand(
          userId,
          dbId,
          statement,
          this.playgroundContext.courseId
        )
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
    if (!this.readOnly) {
      localStorage.setItem("playground-db-type", dbType);
    }

    if (dbType === "postgres") this.mongoDbId = null;

    this.schemaReload$.next();
    this.store.dispatch(
      TemplateActions.setFilterLanguage({ filterLanguage: dbType })
    );
  }

  onMongoDbSelected(fullDbName: string) {
    const userId = this.playgroundContext.userId;
    const prefix = `mongo_playground_student_${userId}_`;
    const suffix = fullDbName.startsWith(prefix)
      ? fullDbName.replace(prefix, "")
      : fullDbName;

    this.mongoDbId = suffix;
    if (!this.readOnly) {
      localStorage.setItem("playground-mongo-db-full", fullDbName);
      localStorage.setItem("playground-mongo-db", suffix);
    }

    setTimeout(() => {
      this.schemaReload$.next();
    }, 0);
  }

  ngAfterViewChecked() {
    if (this.selectedDbType === "mongo") {
      Prism.highlightAll();
    }
  }

  ngOnDestroy() {
    this.playgroundContext.reset();
  }
}

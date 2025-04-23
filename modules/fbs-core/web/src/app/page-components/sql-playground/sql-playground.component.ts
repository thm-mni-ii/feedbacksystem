import {AfterViewChecked, Component, OnInit} from "@angular/core";
import {Store} from "@ngrx/store";
import {Observable, of} from "rxjs";
import {Routine} from "src/app/model/sql_playground/Routine";
import {Trigger} from "src/app/model/sql_playground/Trigger";
import {View} from "src/app/model/sql_playground/View";
import {Table} from "src/app/model/sql_playground/Table";
import {Constraint} from "src/app/model/sql_playground/Constraint";
import {TitlebarService} from "../../service/titlebar.service";
import {AuthService} from "src/app/service/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import * as SqlPlaygroundActions from "./state/sql-playground.actions";
import * as fromSqlPlayground from "./state/sql-playground.selectors";
import {BackendService} from "./collab/backend.service";
import {HttpClient} from "@angular/common/http";
import {MongoPlaygroundService} from "src/app/service/mongo-playground.service";
import {Subject} from "rxjs";

import Prism from 'prismjs';
import 'prismjs/components/prism-json';

@Component({
  selector: "app-sql-playground-management",
  templateUrl: "./sql-playground.component.html",
  styleUrls: ["./sql-playground.component.scss"],
})
export class SqlPlaygroundComponent implements OnInit {
  activeDb$: Observable<number>;
  resultset$: Observable<any>;
  triggers$: Observable<Trigger[]>;
  routines$: Observable<Routine[]>;
  views$: Observable<View[]>;
  tables$: Observable<Table[]>;
  constraints$: Observable<Constraint[]>;
  isQueryPending$: Observable<boolean>;
  selectedDbType: 'postgres' | 'mongo' = 'postgres';
  mongoDbId: string | null = null;
  schemaReload$ = new Subject<void>();
  mongoRawResult$: Observable<any> = of(null);

  constructor(
    private titlebar: TitlebarService,
    private authService: AuthService,
    private backendService: BackendService,
    private snackbar: MatSnackBar,
    private store: Store,
    private http: HttpClient,
    private mongoPlaygroundService: MongoPlaygroundService
  ) {
  }

  ngOnInit() {
    const savedDbType = localStorage.getItem('playground-db-type') as 'postgres' | 'mongo';
    this.selectedDbType = savedDbType ?? 'postgres';
    this.titlebar.emitTitle("SQL Playground");
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
    this.mongoDbId = localStorage.getItem('playground-mongo-db');

    if (this.selectedDbType === 'mongo') {
      const userId = this.authService.getToken().id;
      this.mongoDbId = localStorage.getItem('playground-mongo-db');

      this.http.get<string[]>(`/api/v2/playground/${userId}/databases/mongo/list`)
        .subscribe((dbs) => {
          if (!this.mongoDbId && dbs.length > 0) {
            this.mongoDbId = dbs[0];
            localStorage.setItem('playground-mongo-db', this.mongoDbId);
          }
        });
    }
  }

  changeActiveDbId(dbId: number) {
    this.store.dispatch(SqlPlaygroundActions.changeActiveDbId({dbId}));
    this.updateScheme();
  }

  changeQueryPending() {
    this.store.dispatch(SqlPlaygroundActions.updateScheme());
  }

  updateScheme() {
    this.store.dispatch(SqlPlaygroundActions.updateScheme());
  }

  submitStatement(statement: string) {
    if (this.selectedDbType === 'postgres') {
      this.store.dispatch(SqlPlaygroundActions.submitStatement({statement}));
      return;
    }

    let parsedQuery;
    try {
      parsedQuery = JSON.parse(statement);
    } catch {
      this.snackbar.open("Invalid JSON", "Error", {duration: 3000});
      return;
    }

    const dbSuffixOrFull = this.mongoDbId || localStorage.getItem('playground-mongo-db');
    const userId = this.authService.getToken().id;

    if (!dbSuffixOrFull) {
      this.snackbar.open("Keine Mongo-Datenbank ausgewählt", "Fehler", {duration: 3000});
      return;
    }

    const prefix = `mongo_playground_student_${userId}_`;
    const fullDb = dbSuffixOrFull.startsWith(prefix) ? dbSuffixOrFull : prefix + dbSuffixOrFull;
    console.log('fullDb:', fullDb);

    const dbId = fullDb.split(prefix)[1];
    console.log('dbId:', dbId);

    if (!dbId) {
      this.snackbar.open("Ungültige Mongo-Datenbank", "Fehler", {duration: 3000});
      return;
    }

    this.mongoPlaygroundService.executeMongoQuery(userId, dbId, parsedQuery).subscribe({
      next: (res) => {
        if (parsedQuery.operation === 'find' || parsedQuery.operation === 'aggregate')
          this.mongoRawResult$ = of(res);
        else {
          this.snackbar.open("MongoDB Operation erfolgreich", "Ok", { duration: 3000 });  // SnackBar für Insert etc.
          this.mongoRawResult$ = of(null);
        }
        this.schemaReload$.next();
      },
      error: (err) =>
        this.snackbar.open("MongoDB Fehler: " + (err.error?.message ?? "Unbekannt"), "Fehler", {
          duration: 3000,
        }),
    });
  }

  onDbChanged(dbType: 'postgres' | 'mongo') {
    this.selectedDbType = dbType;
    localStorage.setItem('playground-db-type', dbType);

    if (dbType === 'postgres')
      this.mongoDbId = null;

    this.schemaReload$.next();
  }

  onMongoDbSelected(dbSuffix: string) {
    this.mongoDbId = dbSuffix;
    localStorage.setItem('playground-mongo-db', dbSuffix);
    this.schemaReload$.next();
  }

  ngAfterViewChecked() {
    if (this.selectedDbType === 'mongo') {
      Prism.highlightAll();
    }
  }
}

import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
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
import { BackendService } from "./collab/backend.service";
import { HttpClient } from "@angular/common/http";
import { MongoPlaygroundService } from "src/app/service/mongo-playground.service";

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

    if (this.selectedDbType === 'mongo') {
      const userId = this.authService.getToken().id;
      this.http.get<string[]>(`/api/v2/playground/${userId}/databases/mongo/list`)
        .subscribe((dbs) => {
          this.mongoDbId = dbs[0] ?? null;
        });
    }
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
    if(this.selectedDbType === 'postgres') {
      this.store.dispatch(SqlPlaygroundActions.submitStatement({ statement }));
    } else {
      let parsedQuery;
      try {
        parsedQuery = JSON.parse(statement);
      } catch {
        this.snackbar.open("Invalid JSON", "Error", { duration: 3000 });
        return;
      }

      const userId = this.authService.getToken().id;
      const dbId = this.mongoDbId;

      if(!dbId) {
        this.snackbar.open("No MongoDB Database found", "Error", { duration: 3000 });
        return;
      }

      this.mongoPlaygroundService.executeMongoQuery(userId, dbId, parsedQuery).subscribe({
        next: (res) => console.log("MongoDB Result:", res),
        error: (err) => this.snackbar.open("MongoDB Fehler: " + (err.error?.message ?? "Unbekannt"), "Fehler", { duration: 3000 })
      });
    }
  }

  onDbChanged(db: 'postgres' | 'mongo') {
    this.selectedDbType = db;
    localStorage.setItem('playground-db-type', db);

    if (db === 'mongo') {
      const userId = this.authService.getToken().id;
      this.http.get<string[]>(`/api/v2/playground/${userId}/databases/mongo/list`)
        .subscribe((dbs) => {
          this.mongoDbId = dbs[0] ?? null;
        });
    }
  }
}

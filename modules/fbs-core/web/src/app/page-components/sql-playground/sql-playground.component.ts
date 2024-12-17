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

  constructor(
    private titlebar: TitlebarService,
    private authService: AuthService,
    private backendService: BackendService,
    private snackbar: MatSnackBar,
    private store: Store
  ) {}

  ngOnInit() {
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
    this.store.dispatch(SqlPlaygroundActions.submitStatement({ statement }));
  }
}

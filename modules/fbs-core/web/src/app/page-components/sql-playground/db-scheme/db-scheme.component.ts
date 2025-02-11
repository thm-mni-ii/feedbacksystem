import { Component, Input, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { Table } from "src/app/model/sql_playground/Table";
import { View } from "src/app/model/sql_playground/View";
import { Trigger } from "src/app/model/sql_playground/Trigger";
import { Routine } from "src/app/model/sql_playground/Routine";
import { Constraint } from "src/app/model/sql_playground/Constraint";
import * as fromSqlPlayground from "../state/sql-playground.selectors";

@Component({
  selector: "app-db-scheme",
  templateUrl: "./db-scheme.component.html",
  styleUrls: ["./db-scheme.component.scss"],
})
export class DbSchemeComponent implements OnInit {
  @Input() title: string;

  tables$: Observable<Table[]>;
  views$: Observable<View[]>;
  triggers$: Observable<Trigger[]>;
  routines$: Observable<Routine[]>;
  constraints$: Observable<Constraint[]>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.tables$ = this.store.select(fromSqlPlayground.selectTables);
    this.views$ = this.store.select(fromSqlPlayground.selectViews);
    this.triggers$ = this.store.select(fromSqlPlayground.selectTriggers);
    this.routines$ = this.store.select(fromSqlPlayground.selectRoutines);
    this.constraints$ = this.store.select(fromSqlPlayground.selectConstraints);
  }
}

import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, Subject } from "rxjs";
import { Table } from "src/app/model/sql_playground/Table";
import { View } from "src/app/model/sql_playground/View";
import { Trigger } from "src/app/model/sql_playground/Trigger";
import { Routine } from "src/app/model/sql_playground/Routine";
import { Constraint } from "src/app/model/sql_playground/Constraint";
import * as fromSqlPlayground from "../state/sql-playground.selectors";
import { EventEmitter, Output } from "@angular/core";

@Component({
  selector: "app-db-scheme",
  templateUrl: "./db-scheme.component.html",
  styleUrls: ["./db-scheme.component.scss"],
})
export class DbSchemeComponent implements OnInit, OnChanges {
  @Input() title: string;
  @Input() dbName: string;
  @Input() dbType: "postgres" | "mongo";
  @Input() reloadTrigger: Subject<void>;
  @Output() submitStatement = new EventEmitter<string>();

  tables$: Observable<Table[]>;
  views$: Observable<View[]>;
  triggers$: Observable<Trigger[]>;
  routines$: Observable<Routine[]>;
  constraints$: Observable<Constraint[]>;
  selectedDbType: "postgres" | "mongo" | null = null;
  collections$: Observable<string[]>;

  constructor(private store: Store) {
    this.selectedDbType = localStorage.getItem("playground-db-type") as
      | "postgres"
      | "mongo"
      | null;
  }

  ngOnInit(): void {
    this.selectedDbType = this.dbType || this.selectedDbType;

    if (this.selectedDbType === "postgres") {
      this.initPostgresSelectors();
    }

    if (this.reloadTrigger) {
      this.reloadTrigger.subscribe(() => {});
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["dbType"]?.currentValue) {
      this.selectedDbType = changes["dbType"].currentValue;
      if (this.selectedDbType === "postgres") {
        this.initPostgresSelectors();
      }
    }
  }

  private initPostgresSelectors(): void {
    this.tables$ = this.store.select(fromSqlPlayground.selectTables);
    this.views$ = this.store.select(fromSqlPlayground.selectViews);
    this.triggers$ = this.store.select(fromSqlPlayground.selectTriggers);
    this.routines$ = this.store.select(fromSqlPlayground.selectRoutines);
    this.constraints$ = this.store.select(fromSqlPlayground.selectConstraints);
  }
}

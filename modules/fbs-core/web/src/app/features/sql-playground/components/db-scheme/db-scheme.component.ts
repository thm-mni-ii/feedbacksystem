import { Component, Input, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, Subject } from "rxjs";
import { Table } from "../../models/Table";
import { View } from "../../models/View";
import { Trigger } from "../../models/Trigger";
import { Routine } from "../../models/Routine";
import { Constraint } from "../../models/Constraint";
import * as fromSqlPlayground from "../state/sql-playground.selectors";
import { MongoPlaygroundService } from "../../../../service/mongo-playground.service";
import { AuthService } from "../../../../service/auth.service";
import { EventEmitter, Output } from "@angular/core";

@Component({
  selector: "app-db-scheme",
  templateUrl: "./db-scheme.component.html",
  styleUrls: ["./db-scheme.component.scss"],
})
export class DbSchemeComponent implements OnInit {
  @Input() title: string;
  @Input() dbName: string;
  @Input() reloadTrigger: Subject<void>;
  @Output() submitStatement = new EventEmitter<string>();

  tables$: Observable<Table[]>;
  views$: Observable<View[]>;
  triggers$: Observable<Trigger[]>;
  routines$: Observable<Routine[]>;
  constraints$: Observable<Constraint[]>;
  selectedDbType: "postgres" | "mongo" | null = null;
  collections$: Observable<string[]>;

  constructor(
    private store: Store,
    private mongoService: MongoPlaygroundService,
    private auth: AuthService
  ) {
    this.selectedDbType = localStorage.getItem("playground-db-type") as
      | "postgres"
      | "mongo"
      | null;
  }

  ngOnInit(): void {
    if (this.selectedDbType === "postgres") {
      this.tables$ = this.store.select(fromSqlPlayground.selectTables);
      this.views$ = this.store.select(fromSqlPlayground.selectViews);
      this.triggers$ = this.store.select(fromSqlPlayground.selectTriggers);
      this.routines$ = this.store.select(fromSqlPlayground.selectRoutines);
      this.constraints$ = this.store.select(
        fromSqlPlayground.selectConstraints
      );
    }

    if (this.reloadTrigger) {
      this.reloadTrigger.subscribe(() => {});
    }
  }
}

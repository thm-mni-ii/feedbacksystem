import {Component, Input, OnInit} from "@angular/core";
import {Store} from "@ngrx/store";
import {Observable, Subject} from "rxjs";
import {Table} from "src/app/model/sql_playground/Table";
import {View} from "src/app/model/sql_playground/View";
import {Trigger} from "src/app/model/sql_playground/Trigger";
import {Routine} from "src/app/model/sql_playground/Routine";
import {Constraint} from "src/app/model/sql_playground/Constraint";
import * as fromSqlPlayground from "../state/sql-playground.selectors";
import {MongoPlaygroundService} from "../../../service/mongo-playground.service";
import {AuthService} from "../../../service/auth.service";
import { EventEmitter, Output } from "@angular/core";

@Component({
  selector: "app-db-scheme",
  templateUrl: "./db-scheme.component.html",
  styleUrls: ["./db-scheme.component.scss"],
})
export class DbSchemeComponent implements OnInit {
  @Input() title: string;
  @Output() submitStatement = new EventEmitter<string>();

  tables$: Observable<Table[]>;
  views$: Observable<View[]>;
  triggers$: Observable<Trigger[]>;
  routines$: Observable<Routine[]>;
  constraints$: Observable<Constraint[]>;
  selectedDbType: 'postgres' | 'mongo' | null = null;
  collections$: Observable<string[]>;
  @Input() reloadTrigger: Subject<void>

  constructor(
    private store: Store,
    private mongoService: MongoPlaygroundService,
    private auth: AuthService) {
    this.selectedDbType = localStorage.getItem('playground-db-type') as 'postgres' | 'mongo' | null;
  }

  ngOnInit(): void {
    if (this.selectedDbType === 'postgres') {
      this.tables$ = this.store.select(fromSqlPlayground.selectTables);
      this.views$ = this.store.select(fromSqlPlayground.selectViews);
      this.triggers$ = this.store.select(fromSqlPlayground.selectTriggers);
      this.routines$ = this.store.select(fromSqlPlayground.selectRoutines);
      this.constraints$ = this.store.select(fromSqlPlayground.selectConstraints);
    }

    if (this.reloadTrigger) {
      this.reloadTrigger.subscribe(() => {
      });
    }
  }


/*
    else if (this.selectedDbType === 'mongo') {
      const dbId = localStorage.getItem('playground-mongo-db');
      const userId = this.auth.getToken().id;

      if (dbId && userId) {
        this.collections$ = this.mongoService.getMongoCollections(userId, dbId);
      }
    }

 */

}

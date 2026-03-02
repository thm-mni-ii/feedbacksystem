import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { Routine } from "src/app/model/sql_playground/Routine";
import * as fromSqlPlayground from "../../state/sql-playground.selectors";

@Component({
  selector: "app-db-scheme-routines",
  templateUrl: "./db-scheme-routines.component.html",
  styleUrls: ["../db-scheme.component.scss"],
})
export class DbSchemeRoutinesComponent {
  routines$: Observable<Routine[]>;

  constructor(private store: Store) {
    this.routines$ = this.store.select(fromSqlPlayground.selectRoutines);
  }
}

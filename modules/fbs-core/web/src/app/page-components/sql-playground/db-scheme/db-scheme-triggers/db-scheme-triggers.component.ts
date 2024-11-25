import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { Trigger } from "src/app/model/sql_playground/Trigger";
import * as fromSqlPlayground from "../../state/sql-playground.selectors";

@Component({
  selector: "app-db-scheme-triggers",
  templateUrl: "./db-scheme-triggers.component.html",
  styleUrls: ["../db-scheme.component.scss"],
})
export class DbSchemeTriggersComponent {
  triggers$: Observable<Trigger[]>;

  constructor(private store: Store) {
    this.triggers$ = this.store.select(fromSqlPlayground.selectTriggers);
  }
}

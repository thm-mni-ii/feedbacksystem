import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { View } from "src/app/model/sql_playground/View";
import * as fromSqlPlayground from "../../state/sql-playground.selectors";

@Component({
  selector: "app-db-scheme-views",
  templateUrl: "./db-scheme-views.component.html",
  styleUrls: ["../db-scheme.component.scss"],
})
export class DbSchemeViewsComponent {
  views$: Observable<View[]>;

  constructor(private store: Store) {
    this.views$ = this.store.select(fromSqlPlayground.selectViews);
  }
}

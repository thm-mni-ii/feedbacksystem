import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { Constraint } from "src/app/model/sql_playground/Constraint";
import { Table } from "src/app/model/sql_playground/Table";
import * as fromSqlPlayground from "../../state/sql-playground.selectors";

@Component({
  selector: "app-db-scheme-tables",
  templateUrl: "./db-scheme-tables.component.html",
  styleUrls: ["../db-scheme.component.scss"],
})
export class DbSchemeTablesComponent implements OnInit {
  @Output() submitStatement = new EventEmitter<string>();

  tables$: Observable<Table[]>;
  constraints$: Observable<Constraint[]>;
  updatedTables$: Observable<Table[]>;

  constructor(private store: Store) {
    this.tables$ = this.store.select(fromSqlPlayground.selectTables);
    this.constraints$ = this.store.select(fromSqlPlayground.selectConstraints);
  }

  ngOnInit() {
    this.updatedTables$ = combineLatest([this.tables$, this.constraints$]).pipe(
      map(([tables, constraints]) => {
        if (!tables || !constraints) return [];

        return tables.map((table) => {
          const tableConstraints = constraints.find(
            (constraint) => constraint.table === table.name
          );

          if (!tableConstraints) return table;

          const sortedConstraints = [...tableConstraints.constraints].sort(
            (a, b) => (a.type > b.type ? -1 : 1)
          );

          const updatedColumns = table.columns.map((column) => ({
            ...column,
            isPrimaryKey: sortedConstraints.some(
              (constraint) =>
                constraint.columnName === column.name &&
                constraint.type === "PRIMARY KEY"
            ),
          }));

          return {
            ...table,
            constraints: {
              ...tableConstraints,
              constraints: sortedConstraints,
            },
            columns: updatedColumns,
          } as Table;
        });
      })
    );
  }

  showTableData(event: any, tableName: string): void {
    event.stopPropagation();
    this.submitStatement.emit(`SELECT * FROM ${tableName};`);
  }
}

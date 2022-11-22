import { Component, Input, OnInit } from "@angular/core";
import { Constraint } from "src/app/model/sql_playground/Constraint";
import { Table } from "src/app/model/sql_playground/Table";
import { DbSchemeComponent } from "../db-scheme.component";

@Component({
  selector: "app-db-scheme-table",
  templateUrl: "./db-scheme-tables.component.html",
  styleUrls: ["../db-scheme.component.scss"],
})
export class DbSchemeTablesComponent extends DbSchemeComponent {
  @Input() tables: Table[];
  @Input() constraints: Constraint[];

  ngOnChanges() {
    if (this.tables !== undefined && this.constraints !== undefined) {
      this.tables.forEach((table) => {
        let constraints = this.constraints.filter(
          (constraint) => constraint.table_name === table.table_name
        );
        table.constraints = constraints[0];
        table.constraints.constrains.sort((a, b) =>
          a.constraintType > b.constraintType ? -1 : 1
        );

        table.columns.forEach((column) => {
          let isPk = table.constraints.constrains.filter(
            (constraint) =>
              constraint.columnName == column.columnName &&
              constraint.constraintType == "PRIMARY KEY"
          );
          column.isPrimaryKey = isPk.length > 0;
        });
      });
    }

    console.log(this.tables);
  }
}

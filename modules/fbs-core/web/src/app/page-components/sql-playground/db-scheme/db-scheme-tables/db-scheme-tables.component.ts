import { Component, Input, OnChanges } from "@angular/core";
import { Constraint } from "src/app/model/sql_playground/Constraint";
import { Table } from "src/app/model/sql_playground/Table";
import { DbSchemeComponent } from "../db-scheme.component";

@Component({
  selector: "app-db-scheme-table",
  templateUrl: "./db-scheme-tables.component.html",
  styleUrls: ["../db-scheme.component.scss"],
})
export class DbSchemeTablesComponent
  extends DbSchemeComponent
  implements OnChanges
{
  @Input() tables: Table[];
  @Input() constraints: Constraint[];

  ngOnChanges() {
    if (this.tables !== undefined && this.constraints !== undefined) {
      this.tables.forEach((table) => {
        let tableConstraints = this.constraints.filter(
          (constraint) => constraint.table === table.name
        );
        table.constraints = tableConstraints[0];
        table.constraints.constraints.sort((a, b) =>
          a.type > b.type ? -1 : 1
        );

        table.columns.forEach((column) => {
          let isPk = table.constraints.constraints.filter(
            (constraint) =>
              constraint.columnName == column.name &&
              constraint.type == "PRIMARY KEY"
          );
          column.isPrimaryKey = isPk.length > 0;
        });
      });
    }
  }
}

import { Component, Input, OnInit } from "@angular/core";
import { DbSchemeComponent } from "../db-scheme.component";
import tablesJson from "../test-data/tables.json";

@Component({
  selector: "app-db-scheme-table",
  templateUrl: "./db-scheme-tables.component.html",
  styleUrls: ["../db-scheme.component.scss"],
})
export class DbSchemeTablesComponent
  extends DbSchemeComponent
  implements OnInit
{
  @Input() tables: Array<any> = this.getTables();

  getTables(): Array<any> {
    return tablesJson.tables;
  }

  ngOnInit(): void {
    console.log("");
  }
}

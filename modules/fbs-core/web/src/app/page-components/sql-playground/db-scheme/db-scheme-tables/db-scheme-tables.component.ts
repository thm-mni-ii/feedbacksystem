import { Component, Input, OnInit } from "@angular/core";
import { DbSchemeComponent } from "../db-scheme.component";

@Component({
  selector: "app-db-scheme-table",
  templateUrl: "./db-scheme-tables.component.html",
  styleUrls: ["../db-scheme.component.scss"],
})
export class DbSchemeTablesComponent
  extends DbSchemeComponent
  implements OnInit
{
  @Input() tables: Array<any>;

  ngOnInit(): void {}

  ngOnChanges(): void {
    // console.log(this.tables);
  }
}

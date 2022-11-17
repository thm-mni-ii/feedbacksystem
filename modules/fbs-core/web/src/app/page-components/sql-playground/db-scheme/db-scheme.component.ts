import { Component, Input, OnInit } from "@angular/core";
import data from "./test-data/test.json";

@Component({
  selector: "app-db-scheme",
  templateUrl: "./db-scheme.component.html",
  styleUrls: ["./db-scheme.component.scss"],
})
export class DbSchemeComponent implements OnInit {
  @Input() title: string;

  constructor() {}

  ngOnInit(): void {
    console.log("");
  }
}

@Component({
  selector: "app-db-scheme-table",
  templateUrl: "./db-scheme-tables.component.html",
  styleUrls: ["./db-scheme.component.scss"],
})
export class DbSchemeComponentTable extends DbSchemeComponent {

  @Input() tables: Array<any> = this.getTables();

  getTables(): Array<any> {
    return data.tables;
  }

  ngOnInit(): void {
    console.log("");
  }
}
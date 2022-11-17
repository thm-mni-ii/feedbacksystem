import { Component, Input, OnInit } from "@angular/core";
import tables from "./test-data/tables.json";
import views from "./test-data/views.json";

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
    return tables.tables;
  }

  ngOnInit(): void {
    console.log("");
  }
}

@Component({
  selector: "app-db-scheme-views",
  templateUrl: "./db-scheme-view.component.html",
  styleUrls: ["./db-scheme.component.scss"],
})
export class DbSchemeComponentViews extends DbSchemeComponent {

  @Input() views: Array<any> = this.getViews();

  getViews(): Array<any> {
    return views.views;
  }

  ngOnInit(): void {
    console.log("");
  }
}
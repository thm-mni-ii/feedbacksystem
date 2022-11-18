import { Component, Input, OnInit } from "@angular/core";
import { Trigger } from "src/app/model/sql_playground/Trigger";
import tablesJson from "./test-data/tables.json";
import viewsJson from "./test-data/views.json";
import triggersJson from "./test-data/trigger.json";
import routinesJson from "./test-data/routines.json";

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
    return tablesJson.tables;
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
    return viewsJson.views;
  }

  ngOnInit(): void {
    console.log("");
  }
}

@Component({
  selector: "app-db-scheme-triggers",
  templateUrl: "./db-scheme-triggers.component.html",
  styleUrls: ["./db-scheme.component.scss"],
})
export class DbSchemeTrigger extends DbSchemeComponent {

  @Input() triggers: Array<Trigger> = this.getViews();

  getViews(): Array<Trigger> {
    return [];
  }

  ngOnInit(): void {
    console.log("");
  }
}

@Component({
  selector: "app-db-scheme-routines",
  templateUrl: "./db-scheme-routines.component.html",
  styleUrls: ["./db-scheme.component.scss"],
})
export class DbSchemeRoutines extends DbSchemeComponent {

  @Input() routines: Array<any> = this.getViews();

  getViews(): Array<any> {
    return routinesJson.SQLRoutines;
  }

  ngOnInit(): void {
    console.log("");
  }
}
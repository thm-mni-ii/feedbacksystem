import { Component, Input, OnInit } from "@angular/core";
import { Trigger } from "src/app/model/sql_playground/Trigger";
import { Routine } from "src/app/model/sql_playground/Routine";
import { View } from "src/app/model/sql_playground/View";
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
  @Input() views: View[] = viewsJson.SQLViews;

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
  @Input() triggers: Trigger[] = triggersJson.SQLTriggers;

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
  @Input() routines: Routine[] = routinesJson.SQLRoutines;

  ngOnInit(): void {
    console.log("");
  }
}

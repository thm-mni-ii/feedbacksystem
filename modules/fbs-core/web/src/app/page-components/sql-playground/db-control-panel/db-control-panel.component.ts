import { Component, OnInit } from "@angular/core";
import { Database } from "../../../model/sql_playground/Database";
import databases from "./test-data/databases.json";

@Component({
  selector: "app-db-control-panel",
  templateUrl: "./db-control-panel.component.html",
  styleUrls: ["./db-control-panel.component.scss"],
})
export class DbControlPanelComponent implements OnInit {
  dbs: Database[] = databases.databases;
  activeDb: Database = this.getActiveDb();
  selectedDb: Number = this.activeDb.id;

  constructor() {}

  ngOnInit(): void {
    // TODO: show active db in dropdown
    console.log("");
  }

  getActiveDb(): Database {
    return this.dbs.find((db) => db.active);
  }
}

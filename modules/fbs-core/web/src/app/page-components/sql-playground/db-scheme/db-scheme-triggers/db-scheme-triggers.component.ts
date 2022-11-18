import { Component, Input } from "@angular/core";
import { Trigger } from "src/app/model/sql_playground/Trigger";
import { DbSchemeComponent } from "../db-scheme.component";
import triggersJson from "../test-data/trigger.json";

@Component({
  selector: "app-db-scheme-triggers",
  templateUrl: "./db-scheme-triggers.component.html",
  styleUrls: ["../db-scheme.component.scss"],
})
export class DbSchemeTriggersComponent extends DbSchemeComponent {
  @Input() triggers: Trigger[] = triggersJson.SQLTriggers;

  ngOnInit(): void {
    console.log("");
  }
}

import { Component, Input, OnInit } from "@angular/core";
import { Routine } from "src/app/model/sql_playground/Routine";
import { DbSchemeComponent } from "../db-scheme.component";
import routinesJson from "../test-data/routines.json";

@Component({
  selector: "app-db-scheme-routines",
  templateUrl: "./db-scheme-routines.component.html",
  styleUrls: ["../db-scheme.component.scss"],
})
export class DbSchemeRoutinesComponent
  extends DbSchemeComponent
  implements OnInit
{
  @Input() routines: Routine[] = routinesJson.SQLRoutines;

  ngOnInit(): void {
    console.log("");
  }
}

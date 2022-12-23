import { Component, Input } from "@angular/core";
import { Routine } from "src/app/model/sql_playground/Routine";
import { DbSchemeComponent } from "../db-scheme.component";

@Component({
  selector: "app-db-scheme-routines",
  templateUrl: "./db-scheme-routines.component.html",
  styleUrls: ["../db-scheme.component.scss"],
})
export class DbSchemeRoutinesComponent extends DbSchemeComponent {
  @Input() routines: Routine[];
}

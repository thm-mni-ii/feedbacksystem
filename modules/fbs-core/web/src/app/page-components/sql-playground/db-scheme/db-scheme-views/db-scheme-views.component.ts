import { Component, Input, OnInit } from "@angular/core";
import { View } from "src/app/model/sql_playground/View";
import { DbSchemeComponent } from "../db-scheme.component";

@Component({
  selector: "app-db-scheme-views",
  templateUrl: "./db-scheme-views.component.html",
  styleUrls: ["../db-scheme.component.scss"],
})
export class DbSchemeViewsComponent extends DbSchemeComponent {
  @Input() views: View[];
}

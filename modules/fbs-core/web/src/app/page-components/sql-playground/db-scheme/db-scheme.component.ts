import { Component, Input } from "@angular/core";

@Component({
  selector: "app-db-scheme",
  templateUrl: "./db-scheme.component.html",
  styleUrls: ["./db-scheme.component.scss"],
})
export class DbSchemeComponent {
  @Input() title: string;

  constructor() {}
}

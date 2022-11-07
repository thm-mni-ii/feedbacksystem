import { Component, OnInit } from "@angular/core";
import { TitlebarService } from "../../service/titlebar.service";

/**
 * This component is for the sql playground
 */
@Component({
  selector: "app-sql-playground-management",
  templateUrl: "./sql-playground.component.html",
  styleUrls: ["./sql-playground.component.scss"],
})
export class SqlPlaygroundComponent implements OnInit {
  constructor(private titlebar: TitlebarService) {}

  ngOnInit() {
    this.titlebar.emitTitle("SQL Playground");
  }
}
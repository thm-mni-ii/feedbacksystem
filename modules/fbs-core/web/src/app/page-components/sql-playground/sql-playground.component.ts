import { Component, OnInit, ViewChild } from "@angular/core";
import { TitlebarService } from "../../service/titlebar.service";

/**
 * This component is for admins managing users
 */
@Component({
  selector: "sql-playground-management",
  templateUrl: "./sql-playground.component.html",
  styleUrls: ["./sql-playground.component.scss"],
})
export class SqlPlaygroundComponent implements OnInit {
  constructor(private titlebar: TitlebarService) {}

  ngOnInit() {
    this.titlebar.emitTitle("SQL Playground");
  }
}

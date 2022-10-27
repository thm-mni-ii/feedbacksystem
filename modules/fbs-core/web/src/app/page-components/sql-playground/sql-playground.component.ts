import { Component, OnInit, QueryList, ViewChildren } from "@angular/core";
import { TitlebarService } from "../../service/titlebar.service";
import { MatTabsModule, MatTabGroup, MatTab } from "@angular/material/tabs";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Label } from "ng2-charts";
import { MatLabel } from "@angular/material/form-field";

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
  @ViewChildren(MatTab, { read: MatTab })
  public tabNodes: QueryList<MatTab>;
  public tabs = [{name:undefined}];

  closeTab(index: number) {
    this.tabs.splice(index, 1);
  }

  addTab(index: number) {
    this.tabs.push({ name: "Query_" + index });
  }

  ngOnInit() {
    this.titlebar.emitTitle("SQL Playground");
  }
}

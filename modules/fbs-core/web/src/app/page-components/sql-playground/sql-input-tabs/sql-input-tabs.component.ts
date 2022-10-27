import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatTab } from '@angular/material/tabs';

@Component({
  selector: "app-sql-input-tabs",
  templateUrl: "./sql-input-tabs.component.html",
  styleUrls: ["./sql-input-tabs.component.scss"],
})
export class SqlInputTabsComponent implements OnInit {
  constructor() {}
  @ViewChildren(MatTab, { read: MatTab })
  public tabNodes: QueryList<MatTab>;
  public tabs = [{ name: undefined }];

  closeTab(index: number) {
    this.tabs.splice(index, 1);
  }

  addTab(index: number) {
    this.tabs.push({ name: "Query_" + index });
  }

  ngOnInit(): void {}
}

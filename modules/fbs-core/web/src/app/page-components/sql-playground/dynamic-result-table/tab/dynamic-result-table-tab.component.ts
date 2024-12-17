import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import {
  selectIsQueryPending,
  selectTabs,
} from "../state/dynamic-result-table.selectors";
import { Store } from "@ngrx/store";
import { ResultTab } from "../../../../model/ResultTab";

@Component({
  selector: "app-dynamic-result-table-tab",
  templateUrl: "./dynamic-result-table-tab.component.html",
  styleUrls: ["./dynamic-result-table-tab.component.scss"],
})
export class DynamicResultTableTabComponent implements OnInit, AfterViewInit {
  @Input() index: number;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private store: Store) {}

  $isQueryPending = this.store.select(selectIsQueryPending);
  $tabs = this.store.select(selectTabs);
  tab: ResultTab;

  dataSource: MatTableDataSource<string[]>;

  ngOnInit(): void {
    this.$tabs.subscribe((tabs) => {
      this.tab = tabs[this.index];
      const results = this.tab?.resultset?.result?.[0];
      console.log("TAB", this.tab);
      if (!results) return;
      console.log(results);
      this.dataSource = new MatTableDataSource(results.rows);
      this.dataSource.paginator = this.paginator;
      console.log("np", this.dataSource.paginator);
    });
  }

  ngAfterViewInit(): void {
    if (!this.paginator) return;
    this.dataSource.paginator = this.paginator;
  }
}

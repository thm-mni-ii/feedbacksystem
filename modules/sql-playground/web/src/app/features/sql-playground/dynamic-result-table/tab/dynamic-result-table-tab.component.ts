import {
  Component,
  Input,
  AfterViewInit,
  ViewChild,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import {
  selectIsQueryPending,
  selectTabs,
} from "../state/dynamic-result-table.selectors";
import { Store } from "@ngrx/store";
import { ResultTab } from "../../../../model/ResultTab";
import { Subscription } from "rxjs";

@Component({
  selector: "app-dynamic-result-table-tab",
  templateUrl: "./dynamic-result-table-tab.component.html",
  styleUrls: ["./dynamic-result-table-tab.component.scss"],
})
export class DynamicResultTableTabComponent
  implements OnChanges, AfterViewInit
{
  @Input() index: number;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  private subscription: Subscription;

  constructor(private store: Store) {}

  $isQueryPending = this.store.select(selectIsQueryPending);
  $tabs = this.store.select(selectTabs);
  tab: ResultTab;

  dataSource: MatTableDataSource<string[]>;

  ngOnChanges(changes: SimpleChanges) {
    if (changes["index"]) {
      if (this.subscription) this.subscription.unsubscribe();
      this.subscription = this.$tabs.subscribe((tabs) => {
        console.log("tabs", { tabs, index: this.index });
        this.tab = tabs[this.index];
        const results = this.tab?.resultset?.result?.[0];
        console.log("TAB", this.tab);
        console.log("results", results);
        if (!results) return;
        console.log(results);
        this.dataSource = new MatTableDataSource(results.rows);
        this.dataSource.paginator = this.paginator;
        console.log("np", this.dataSource.paginator);
      });
    }
  }

  ngAfterViewInit(): void {
    if (!this.paginator) return;
    this.dataSource.paginator = this.paginator;
  }
}

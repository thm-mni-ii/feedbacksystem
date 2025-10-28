import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { Database } from "../../../../model/sql_playground/Database";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/service/auth.service";
import { MatDialog } from "@angular/material/dialog";
import { loadDatabases } from "src/app/page-components/sql-playground/db-control-panel/state/databases.actions";
import {
  selectDatabasesForCurrentType,
  selectCurrentDbType,
  selectDatabasesError,
} from "src/app/page-components/sql-playground/db-control-panel/state/databases.selectors";
import { setBackend } from "../../state/sql-playground.actions";
import { loadGroups } from "../state/groups.actions";
import { selectAllGroups } from "../state/groups.selector";
import { Group } from "../../../../model/Group";
import { SqlPlaygroundService } from "../../../../service/sql-playground.service";
import { selectBackend } from "../../state/sql-playground.selectors";
import { BackendDefintion } from "../../collab/backend.service";
import { closeAllTabs } from "../../sql-input-tabs/state/sql-input-tabs.actions";

@Component({
  selector: "app-db-control-co-working",
  templateUrl: "./db-control-co-working.component.html",
  styleUrls: ["./db-control-co-working.component.scss"],
})
export class DbControlCoWorkingComponent implements OnInit {
  databases$: Observable<Database[]>;
  groups$: Observable<Group[]>;
  error$: Observable<any>;
  backend$: Observable<BackendDefintion>;
  currentDbType$: Observable<"postgres" | "mongo">;
  selectedDatabase: number = 0;
  selectedGroup: number = 0;
  token = this.authService.getToken();
  pending: boolean = false;

  groups: Group[];

  collaborativeMode: boolean = false;

  constructor(
    private store: Store,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog,
    private playgroundService: SqlPlaygroundService
  ) {}

  ngOnInit(): void {
    // Get current db type from localStorage (defaults to postgres for co-working)
    const dbType =
      (localStorage.getItem("playground-db-type") as "postgres" | "mongo") ||
      "postgres";

    this.store.dispatch(loadDatabases({ dbType }));
    this.store.dispatch(loadGroups());

    // Use selector to get databases for current type from state
    this.databases$ = this.store.select(selectDatabasesForCurrentType);
    this.currentDbType$ = this.store.select(selectCurrentDbType);
    this.groups$ = this.store.select(selectAllGroups);
    this.error$ = this.store.select(selectDatabasesError);
    this.backend$ = this.store.select(selectBackend);
    this.groups$.subscribe((groups) => {
      this.groups = groups;
    });
  }

  disconect() {
    this.store.dispatch(setBackend({ backend: { type: "local" } }));
  }

  create() {
    this.databases$.subscribe((dbs) => {
      const database = dbs.find(({ id }) => id === this.selectedDatabase);
      this.playgroundService
        .shareWithGroup(
          this.authService.getToken().id,
          this.selectedDatabase,
          this.selectedGroup
        )
        .subscribe(() => {
          this.store.dispatch(
            setBackend({
              backend: {
                type: "collaborative",
                id: this.selectedGroup.toString(),
                database: {
                  id: database.id as number,
                  name: database.name,
                  owner: this.authService.getToken().username,
                },
              },
            })
          );
          this.store.dispatch(closeAllTabs());
          this.collaborativeMode = true;
        });
    });
  }

  join() {
    this.store.dispatch(
      setBackend({
        backend: { type: "collaborative", id: this.selectedGroup.toString() },
      })
    );
    this.store.dispatch(closeAllTabs());
  }

  activateGroup(groupId: number) {
    console.log(groupId);
    throw new Error("Method not implemented.");
  }
}

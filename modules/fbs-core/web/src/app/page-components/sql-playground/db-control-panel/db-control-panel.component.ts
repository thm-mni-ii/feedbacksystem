import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { Roles } from "src/app/model/Roles";
import { Database } from "src/app/model/sql_playground/Database";
import { AuthService } from "src/app/service/auth.service";
import {
  loadDatabases,
  createDatabase,
  deleteDatabase,
  activateDatabase,
} from "src/app/page-components/sql-playground/db-control-panel/state/databases.actions";
import { selectAllDatabases } from "src/app/page-components/sql-playground/db-control-panel/state/databases.selectors";

@Component({
  selector: "app-db-control-panel",
  templateUrl: "./db-control-panel.component.html",
  styleUrls: ["./db-control-panel.component.scss"],
})
export class DbControlPanelComponent implements OnInit {
  @Input() activeDbId: number;
  @Output() changeActiveDbId = new EventEmitter<number>();
  @Output() submitStatement = new EventEmitter<string>();
  @Output() mongoDbSelected = new EventEmitter<string>();
  @Output() schemaReload = new EventEmitter<void>();
  @Output() dbChanged = new EventEmitter<'postgres' | 'mongo'>();

  isAdmin: boolean;
  selectedTab: number = 0;
  activeDb: Database;
  collaborativeMode: boolean = false;
  databases$: Observable<Database[]>;

  constructor(private auth: AuthService, private store: Store) {}

  ngOnInit(): void {
    const globalRole = this.auth.getToken().globalRole;
    this.isAdmin = Roles.GlobalRole.isAdmin(globalRole);

    this.store.dispatch(loadDatabases());
    this.databases$ = this.store.select(selectAllDatabases);

    this.databases$.subscribe((databases) => {
      this.activeDb = databases.find((database) => database.active);
    });
  }

  changeDb(db: Database) {
    this.activeDb = db;
    this.changeActiveDbId.emit(db.id);
  }

  submitStatementToParent(statement: string) {
    this.selectedTab = 0;
    this.submitStatement.emit(statement);
  }

  onCreateDatabase(name: string) {
    this.store.dispatch(createDatabase({ name }));
  }

  onDeleteDatabase(id: number) {
    this.store.dispatch(deleteDatabase({ id }));
  }

  onActivateDatabase(id: number) {
    this.store.dispatch(activateDatabase({ id }));
  }

  dbChangedToParent(db: 'postgres' | 'mongo') {
    this.dbChanged.emit(db);
  }

  mongoDbSelectedToParent(event: string) {
    this.mongoDbSelected.emit(event);
  }

}

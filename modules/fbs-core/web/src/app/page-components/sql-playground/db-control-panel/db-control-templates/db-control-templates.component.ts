import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { Store } from "@ngrx/store";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import {
  loadTemplates,
  loadCategories,
} from "src/app/page-components/sql-playground/db-control-panel/state/templates.actions";
import {
  selectAllTemplates,
  selectAllCategories,
  selectTemplatesError,
} from "src/app/page-components/sql-playground/db-control-panel/state/templates.selectors";
import { NewSqlTemplateComponent } from "src/app/dialogs/new-sql-template/new-sql-template.component";
import { AuthService } from "src/app/service/auth.service";
import { JWTToken } from "src/app/model/JWTToken";
import { Database } from "src/app/model/sql_playground/Database";
import { selectAllDatabases } from "src/app/page-components/sql-playground/db-control-panel/state/databases.selectors";
import { SqlTemplates } from "../../../../model/sql_playground/SqlTemplates";
import { TemplateCategory } from "../../../../model/sql_playground/TemplateCategory";
import { Roles } from "../../../../model/Roles";

@Component({
  selector: "app-db-control-templates",
  templateUrl: "./db-control-templates.component.html",
  styleUrls: ["./db-control-templates.component.scss"],
})
export class DbControlTemplatesComponent implements OnInit {
  @Output() submitStatement = new EventEmitter<string>();
  templates$: Observable<SqlTemplates[]>;
  categories$: Observable<TemplateCategory[]>;
  error$: Observable<any>;
  activeDb$: Observable<Database[]>;

  selectedTemplateId: number = 0;
  token: JWTToken = this.authService.getToken();
  isAdmin: boolean = false;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadTemplates());
    this.store.dispatch(loadCategories());

    this.templates$ = this.store.select(selectAllTemplates);
    this.categories$ = this.store.select(selectAllCategories);
    this.error$ = this.store.select(selectTemplatesError);
    this.activeDb$ = this.store.select(selectAllDatabases);

    const globalRole = this.authService.getToken().globalRole;
    this.isAdmin = Roles.GlobalRole.isAdmin(globalRole);
  }

  editTemplates() {
    this.dialog.open(NewSqlTemplateComponent, {
      height: "auto",
      width: "70%",
      data: {
        token: this.token,
      },
    });
  }

  insertTemplate() {
    this.templates$.subscribe((templates) => {
      const template = templates.find(
        (template) => template.id === this.selectedTemplateId
      );
      if (template) {
        this.submitStatement.emit(template.templateQuery);
      }
    });
  }
}

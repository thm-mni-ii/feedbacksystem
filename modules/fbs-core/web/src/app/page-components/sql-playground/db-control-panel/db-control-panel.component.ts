import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Roles } from "src/app/model/Roles";
import { Database } from "src/app/model/sql_playground/Database";
import { AuthService } from "src/app/service/auth.service";

@Component({
  selector: "app-db-control-panel",
  templateUrl: "./db-control-panel.component.html",
  styleUrls: ["./db-control-panel.component.scss"],
})
export class DbControlPanelComponent implements OnInit {
  @Input() activeDbId: number;
  @Output() changeActiveDbId = new EventEmitter<number>();
  @Output() submitStatement = new EventEmitter<string>();

  constructor(private auth: AuthService) {}

  isAdmin: boolean;
  selectedTab: number = 0;

  ngOnInit(): void {
    const globalRole = this.auth.getToken().globalRole;
    this.isAdmin = Roles.GlobalRole.isAdmin(globalRole);
  }

  activeDb: Database;
  collaborativeMode: boolean = false;

  changeDb(db: any) {
    this.activeDb = db;
    this.changeActiveDbId.emit(db.id);
  }

  submitStatementToParent(statement: string) {
    this.selectedTab = 0;
    this.submitStatement.emit(statement);
  }
}

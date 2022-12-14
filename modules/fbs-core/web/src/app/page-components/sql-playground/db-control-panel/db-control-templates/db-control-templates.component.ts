import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NewSqlTemplateComponent } from "src/app/dialogs/new-sql-template/new-sql-template.component";
import { JWTToken } from "src/app/model/JWTToken";
import { Database } from "src/app/model/sql_playground/Database";
import { SqlTemplates } from "src/app/model/sql_playground/SqlTemplates";
import { TemplateCategory } from "src/app/model/sql_playground/TemplateCategory";
import { AuthService } from "src/app/service/auth.service";
import { SqlPlaygroundService } from "src/app/service/sql-playground.service";

@Component({
  selector: "app-db-control-templates",
  templateUrl: "./db-control-templates.component.html",
  styleUrls: ["./db-control-templates.component.scss"],
})
export class DbControlTemplatesComponent implements OnInit {
  @Input() activeDb: Database;
  @Input() isAdmin: boolean;

  constructor(
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private sqlPlaygroundService: SqlPlaygroundService
  ) {}

  ngOnInit(): void {
    console.log("");
  }

  selectedTemplateId: number = 0;
  token: JWTToken = this.authService.getToken();

  categories: TemplateCategory[] = [
    {
      id: 1,
      name: "Grundstudium",
    },
    {
      id: 2,
      name: "Hauptstudium",
    },
  ];

  templates: SqlTemplates[] = [
    {
      id: 1,
      name: "Einführungsbeispiel, Schema (DDL)",
      category: this.categories[0],
      templateQuery: "SELECT * FROM table1",
    },
    {
      id: 2,
      name: "Einführungsbeispiel, Daten (DML)",
      category: this.categories[0],
      templateQuery: "SELECT * FROM table2",
    },
    {
      id: 3,
      name: "Ebay, Schema (DDL)",
      category: this.categories[1],
      templateQuery: "SELECT * FROM table3",
    },
    {
      id: 4,
      name: "Ebay, Daten (DML)",
      category: this.categories[1],
      templateQuery: "SELECT * FROM table4",
    },
  ];

  templatesByCategory: any[] = this.getTemplatesByCategory();

  getTemplatesByCategory(): any[] {
    let templatesByCategory: any[] = [];

    this.categories.forEach((category) => {
      let templates = this.templates.filter(
        (template) => template.category.id == category.id
      );
      templatesByCategory.push({
        category: category,
        templates: templates,
      });
    });
    return templatesByCategory;
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
    let template = this.templates.find(
      (template) => template.id == this.selectedTemplateId
    );

    console.log(template.templateQuery);
  }
}

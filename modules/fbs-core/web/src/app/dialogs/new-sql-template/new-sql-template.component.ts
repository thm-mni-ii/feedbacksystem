import { Component, Inject } from "@angular/core";
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";
import { UntypedFormControl, Validators } from "@angular/forms";
import { NewDbDialogComponent } from "../new-db-dialog/new-db-dialog.component";
import { SqlTemplates } from "src/app/model/sql_playground/SqlTemplates";
import { TemplateCategory } from "src/app/model/sql_playground/TemplateCategory";

@Component({
  selector: "app-new-sql-template",
  templateUrl: "./new-sql-template.component.html",
  styleUrls: ["./new-sql-template.component.scss"],
})
export class NewSqlTemplateComponent {
  templateName = new UntypedFormControl("", [Validators.required]);
  selectedCategory: number = 0;
  templateText: string = "";
  isUpdateDialog = false;
  pending: boolean = false;

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
    {
      id: 5,
      name: "Einführungsbeispiel, Schema (DDL)",
      category: this.categories[0],
      templateQuery: "SELECT * FROM table1",
    },
    {
      id: 6,
      name: "Einführungsbeispiel, Daten (DML)",
      category: this.categories[0],
      templateQuery: "SELECT * FROM table2",
    },
    {
      id: 7,
      name: "Ebay, Schema (DDL)",
      category: this.categories[1],
      templateQuery: "SELECT * FROM table3",
    },
    {
      id: 8,
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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NewDbDialogComponent>
  ) {}

  closeDialog() {
    this.dialogRef.close();
  }
}

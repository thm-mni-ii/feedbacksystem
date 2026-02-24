import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UntypedFormControl, Validators } from "@angular/forms";
import { NewDbDialogComponent } from "../new-db-dialog/new-db-dialog.component";
import { Template } from "src/app/model/sql_playground/Template";
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

  templates: Template[] = [
    {
      id: 1,
      name: "Einführungsbeispiel, Schema (DDL)",
      language: "postgres",
      category: this.categories[0],
      templateQuery: "SELECT * FROM table1",
    },
    {
      id: 2,
      name: "Einführungsbeispiel, Daten (DML)",
      language: "postgres",
      category: this.categories[0],
      templateQuery: "SELECT * FROM table2",
    },
    {
      id: 3,
      name: "Ebay, Schema (DDL)",
      language: "postgres",
      category: this.categories[1],
      templateQuery: "SELECT * FROM table3",
    },
    {
      id: 4,
      name: "Ebay, Daten (DML)",
      language: "postgres",
      category: this.categories[1],
      templateQuery: "SELECT * FROM table4",
    },
    {
      id: 5,
      name: "Einführungsbeispiel, Schema (DDL)",
      language: "postgres",
      category: this.categories[0],
      templateQuery: "SELECT * FROM table1",
    },
    {
      id: 6,
      name: "Einführungsbeispiel, Daten (DML)",
      language: "postgres",
      category: this.categories[0],
      templateQuery: "SELECT * FROM table2",
    },
    {
      id: 7,
      name: "Ebay, Schema (DDL)",
      language: "postgres",
      category: this.categories[1],
      templateQuery: "SELECT * FROM table3",
    },
    {
      id: 8,
      name: "Ebay, Daten (DML)",
      language: "postgres",
      category: this.categories[1],
      templateQuery: "SELECT * FROM table4",
    },
    {
      id: 13,
      name: "",
      language: "mongo",
      category: this.categories[1],
      templateQuery: `db.createCollection("customers");db.customers.insertMany([{_id:ObjectId('678f53bb10dd0e8b5a334afc'),name:"Max Mustermann",email:"max.mustermann@example.com",phone:"0123456789",address:"Musterstraße 1, 12345 Musterstadt",paymentMethod:{type:"Paypal"}},{_id:ObjectId('678f53bb10dd0e8b5a334afd'),name:"Anna Schmidt",email:"anna.schmidt@example.com",phone:"9876543210",address:"Beispielweg 2, 54321 Beispielstadt",paymentMethod:{type:"Credit Card"}}]);db.createCollection("restaurants");db.restaurants.insertMany([{_id:ObjectId('678f53fc10dd0e8b5a334afe'),name:"Pizza Rom",cuisine:["italienisch"],openingHours:["Di-Fr 11:00 - 22:00","Sa-So 12:00 - 20:00"],address:"Hauptstraße 1, 12345 Musterstadt",items:[{id:1,name:"Pizza Salami",preis:12.0},{id:2,name:"Pizza Special",preis:14.0}]},{_id:ObjectId('678f53fc10dd0e8b5a334aff'),name:"Bürge und Co.",cuisine:["amerikanisch"],openingHours:["Di-So 10:00 - 23:00"],address:"Marktstraße 4, 12345 Musterstadt",items:[{id:1,name:"Bürger",preis:8.0},{id:2,name:"Cheese Burger",preis:10.0}]}]);db.createCollection("orders");db.orders.insertMany([{customerId:ObjectId("678f53bb10dd0e8b5a334afc"),restaurantId:ObjectId("678f53fc10dd0e8b5a334afe"),orderItems:[1],deliveryTime:ISODate("2024-12-01T18:00:00Z")},{customerId:ObjectId("678f53bb10dd0e8b5a334afc"),restaurantId:ObjectId("678f53fc10dd0e8b5a334aff"),orderItems:[2],deliveryTime:ISODate("2024-12-01T18:00:00Z")},{customerId:ObjectId("678f53bb10dd0e8b5a334afd"),restaurantId:ObjectId("678f53fc10dd0e8b5a334aff"),orderItems:[1,2],deliveryTime:ISODate("2025-12-02T19:00:00Z")},{customerId:ObjectId("678f53bb10dd0e8b5a334afd"),restaurantId:ObjectId("678f53fc10dd0e8b5a334afe"),orderItems:[2,2,2],deliveryTime:ISODate("2025-12-02T19:00:00Z")}]);db.createCollection("reviews");db.reviews.insertMany([{customerId:ObjectId("678f53bb10dd0e8b5a334afc"),restaurantId:ObjectId("678f53fc10dd0e8b5a334afe"),rating:4,reviewText:"Gutes Essen und schnelle Lieferung!"},{customerId:ObjectId("678f53bb10dd0e8b5a334afd"),restaurantId:ObjectId("678f53fc10dd0e8b5a334aff"),rating:5,reviewText:"Sehr gut und lecker!"},{customerId:ObjectId("678f53bb10dd0e8b5a334afd"),restaurantId:ObjectId("678f53fc10dd0e8b5a334aff"),rating:1,reviewText:"Essen war kalt!"}]);`,
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

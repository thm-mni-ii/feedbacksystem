import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { I18NextModule } from "angular-i18next";

import { MaterialComponentsModule } from "../modules/material-components/material-components.module";
import { ConfirmDialogComponent } from "./confirm-dialog/confirm-dialog.component";
import { TextConfirmDialogComponent } from "./text-confirm-dialog/text-confirm-dialog.component";
import { NewDbDialogComponent } from "./new-db-dialog/new-db-dialog.component";
import { SharePlaygroundLinkDialogComponent } from "./share-playground-link-dialog/share-playground-link-dialog.component";
import { NewSqlTemplateComponent } from "./new-sql-template/new-sql-template.component";

@NgModule({
  declarations: [
    ConfirmDialogComponent,
    TextConfirmDialogComponent,
    NewDbDialogComponent,
    SharePlaygroundLinkDialogComponent,
    NewSqlTemplateComponent,
  ],
  imports: [
    CommonModule,
    MaterialComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    I18NextModule,
  ],
  exports: [
    ConfirmDialogComponent,
    TextConfirmDialogComponent,
    NewDbDialogComponent,
    SharePlaygroundLinkDialogComponent,
    NewSqlTemplateComponent,
  ],
})
export class DialogsModule {}

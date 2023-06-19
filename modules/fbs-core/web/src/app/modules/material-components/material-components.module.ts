import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyListModule as MatListModule } from "@angular/material/legacy-list";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacySnackBarModule as MatSnackBarModule } from "@angular/material/legacy-snack-bar";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { MatLegacyPaginatorModule as MatPaginatorModule } from "@angular/material/legacy-paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatRippleModule } from "@angular/material/core";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { MatLegacyTooltipModule as MatTooltipModule } from "@angular/material/legacy-tooltip";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { MatLegacyChipsModule as MatChipsModule } from "@angular/material/legacy-chips";
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from "@angular/material/legacy-autocomplete";
import { MatStepperModule } from "@angular/material/stepper";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";
import { DragDropModule } from "@angular/cdk/drag-drop";

/**
 * Module to manage material components
 */
@NgModule({
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatRadioModule,
    MatDialogModule,
    MatExpansionModule,
    MatRippleModule,
    MatGridListModule,
    MatTabsModule,
    MatTooltipModule,
    MatSelectModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    DragDropModule,
  ],
  exports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatTableModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatRadioModule,
    MatDialogModule,
    MatExpansionModule,
    MatRippleModule,
    MatGridListModule,
    MatTabsModule,
    MatMenuModule,
    MatTooltipModule,
    MatSelectModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    DragDropModule,
  ],
  declarations: [],
})
export class MaterialComponentsModule {}

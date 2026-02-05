import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SqlPlaygroundRoutingModule } from "./sql-playground-routing.module";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { I18NextModule } from "angular-i18next";
import { MaterialComponentsModule } from "../../modules/material-components/material-components.module";

// Components
import { SqlPlaygroundComponent } from "./components/sql-playground.component";
import { DynamicResultTableComponent } from "./components/dynamic-result-table/dynamic-result-table.component";
import { DynamicResultTableTabComponent } from "./components/dynamic-result-table/tab/dynamic-result-table-tab.component";
import { DbControlPanelComponent } from "./components/db-control-panel/db-control-panel.component";
import { DbControlDbOverviewComponent } from "./components/db-control-panel/db-control-db-overview/db-control-db-overview.component";
import { DbControlTemplatesComponent } from "./components/db-control-panel/db-control-templates/db-control-templates.component";
import { DbControlCoWorkingComponent } from "./components/db-control-panel/db-control-co-working/db-control-co-working.component";
import { SqlInputTabsComponent } from "./components/sql-input-tabs/sql-input-tabs.component";
import { HighlightedInputComponent } from "./components/sql-input-tabs/highlighted-input/highlighted-input.component";
import { DbSchemeComponent } from "./components/db-scheme/db-scheme.component";
import { DbSchemeTablesComponent } from "./components/db-scheme/db-scheme-tables/db-scheme-tables.component";
import { DbSchemeViewsComponent } from "./components/db-scheme/db-scheme-views/db-scheme-views.component";
import { DbSchemeTriggersComponent } from "./components/db-scheme/db-scheme-triggers/db-scheme-triggers.component";
import { DbSchemeRoutinesComponent } from "./components/db-scheme/db-scheme-routines/db-scheme-routines.component";
import { DbSchemeCollectionsComponent } from "./components/db-scheme/db-scheme-mongo/db-scheme-collections/db-scheme-collections.component";
import { DbSchemeMongoViewsComponent } from "./components/db-scheme/db-scheme-mongo/db-scheme-views/db-scheme-mongo-views.component";
import { DbSchemeMongoIndexesComponent } from "./components/db-scheme/db-scheme-mongo/db-scheme-indexes/db-scheme-indexes.component";
import { BorderedContainerComponent } from "./components/bordered-container/bordered-container.component";

// Dialogs
import { NewDbDialogComponent } from "./dialogs/new-db-dialog/new-db-dialog.component";
import { NewSqlTemplateComponent } from "./dialogs/new-sql-template/new-sql-template.component";
import { SharePlaygroundLinkDialogComponent } from "./dialogs/share-playground-link-dialog/share-playground-link-dialog.component";

// State
import { sqlPlaygroundReducer } from "./components/state/sql-playground.reducer";
import { SqlPlaygroundEffects } from "./components/state/sql-playground.effects";
import { sqlInputTabsReducer } from "./components/sql-input-tabs/state/sql-input-tabs.reducer";
import { SqlInputTabsEffects } from "./components/sql-input-tabs/state/sql-input-tabs.effects";
import { dynamicResultTableReducer } from "./components/dynamic-result-table/state/dynamic-result-table.reducer";
import { DynamicResultTableEffects } from "./components/dynamic-result-table/state/dynamic-result-table.effects";
import { databasesReducer } from "./components/db-control-panel/state/databases.reducer";
import { DatabasesEffects } from "./components/db-control-panel/state/databases.effects";
import { templatesReducer } from "./components/db-control-panel/state/templates.reducer";
import { groupsReducer } from "./components/db-control-panel/state/groups.reducer";
import { GroupsEffects } from "./components/db-control-panel/state/groups.effects";

@NgModule({
  declarations: [
    SqlPlaygroundComponent,
    DynamicResultTableComponent,
    DynamicResultTableTabComponent,
    DbControlPanelComponent,
    DbControlDbOverviewComponent,
    DbControlTemplatesComponent,
    DbControlCoWorkingComponent,
    SqlInputTabsComponent,
    HighlightedInputComponent,
    DbSchemeComponent,
    DbSchemeTablesComponent,
    DbSchemeViewsComponent,
    DbSchemeTriggersComponent,
    DbSchemeRoutinesComponent,
    DbSchemeCollectionsComponent,
    DbSchemeMongoViewsComponent,
    DbSchemeMongoIndexesComponent,
    BorderedContainerComponent,
    NewDbDialogComponent,
    NewSqlTemplateComponent,
    SharePlaygroundLinkDialogComponent,
  ],
  imports: [
    CommonModule,
    SqlPlaygroundRoutingModule,
    MaterialComponentsModule,
    ReactiveFormsModule,
    FormsModule,
    I18NextModule,
    StoreModule.forFeature("sqlPlayground", sqlPlaygroundReducer),
    StoreModule.forFeature("sqlInputTabs", sqlInputTabsReducer),
    StoreModule.forFeature("dynamicResultTable", dynamicResultTableReducer),
    StoreModule.forFeature("databases", databasesReducer),
    StoreModule.forFeature("templates", templatesReducer),
    StoreModule.forFeature("groups", groupsReducer),
    EffectsModule.forFeature([
      SqlPlaygroundEffects,
      SqlInputTabsEffects,
      DynamicResultTableEffects,
      DatabasesEffects,
      GroupsEffects,
    ]),
  ],
  exports: [
    SqlPlaygroundComponent,
    DynamicResultTableComponent,
    DbControlPanelComponent,
    SqlInputTabsComponent,
    DbSchemeComponent,
    DbSchemeViewsComponent,
    DbSchemeTriggersComponent,
    DbSchemeRoutinesComponent,
    DbSchemeTablesComponent,
    DbControlTemplatesComponent,
    DbControlCoWorkingComponent,
    DbControlDbOverviewComponent,
    HighlightedInputComponent,
    BorderedContainerComponent,
  ],
})
export class SqlPlaygroundFeatureModule {}

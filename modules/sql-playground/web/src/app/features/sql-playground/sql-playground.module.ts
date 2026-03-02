import { isDevMode, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { sqlPlaygroundReducer } from "./state/sql-playground.reducer";
import { SqlPlaygroundEffects } from "./state/sql-playground.effects";
import { SqlPlaygroundComponent } from "./sql-playground.component";
import { DynamicResultTableComponent } from "./dynamic-result-table/dynamic-result-table.component";
import { DynamicResultTableTabComponent } from "./dynamic-result-table/tab/dynamic-result-table-tab.component";
import { DbControlPanelComponent } from "./db-control-panel/db-control-panel.component";
import { DbControlDbOverviewComponent } from "./db-control-panel/db-control-db-overview/db-control-db-overview.component";
import { DbControlCoWorkingComponent } from "./db-control-panel/db-control-co-working/db-control-co-working.component";
import { DbControlTemplatesComponent } from "./db-control-panel/db-control-templates/db-control-templates.component";
import { SqlInputTabsComponent } from "./sql-input-tabs/sql-input-tabs.component";
import { HighlightedInputComponent } from "./sql-input-tabs/highlighted-input/highlighted-input.component";
import { DbSchemeComponent } from "./db-scheme/db-scheme.component";
import { DbSchemeViewsComponent } from "./db-scheme/db-scheme-views/db-scheme-views.component";
import { DbSchemeTriggersComponent } from "./db-scheme/db-scheme-triggers/db-scheme-triggers.component";
import { DbSchemeRoutinesComponent } from "./db-scheme/db-scheme-routines/db-scheme-routines.component";
import { DbSchemeTablesComponent } from "./db-scheme/db-scheme-tables/db-scheme-tables.component";
import { DbSchemeCollectionsComponent } from "./db-scheme/db-scheme-mongo/db-scheme-collections/db-scheme-collections.component";
import { DbSchemeMongoViewsComponent } from "./db-scheme/db-scheme-mongo/db-scheme-views/db-scheme-mongo-views.component";
import { DbSchemeMongoIndexesComponent } from "./db-scheme/db-scheme-mongo/db-scheme-indexes/db-scheme-indexes.component";
import { BorderedContainerComponent } from "./bordered-container/bordered-container.component";

import { sqlInputTabsReducer } from "./sql-input-tabs/state/sql-input-tabs.reducer";
import { dynamicResultTableReducer } from "./dynamic-result-table/state/dynamic-result-table.reducer";
import { databasesReducer } from "./db-control-panel/state/databases.reducer";
import { templatesReducer } from "./db-control-panel/state/templates.reducer";
import { groupsReducer } from "./db-control-panel/state/groups.reducer";

import { SqlInputTabsEffects } from "./sql-input-tabs/state/sql-input-tabs.effects";
import { DynamicResultTableEffects } from "./dynamic-result-table/state/dynamic-result-table.effects";
import { DatabasesEffects } from "./db-control-panel/state/databases.effects";
import { GroupsEffects } from "./db-control-panel/state/groups.effects";

import { MaterialComponentsModule } from "../../modules/material-components/material-components.module";
import { DialogsModule } from "../../dialogs/dialogs.module";
import { I18NextModule } from "angular-i18next";

@NgModule({
  declarations: [
    SqlPlaygroundComponent,
    DynamicResultTableComponent,
    DynamicResultTableTabComponent,
    DbControlPanelComponent,
    DbControlDbOverviewComponent,
    DbControlCoWorkingComponent,
    DbControlTemplatesComponent,
    SqlInputTabsComponent,
    HighlightedInputComponent,
    DbSchemeComponent,
    DbSchemeViewsComponent,
    DbSchemeTriggersComponent,
    DbSchemeRoutinesComponent,
    DbSchemeTablesComponent,
    DbSchemeCollectionsComponent,
    DbSchemeMongoViewsComponent,
    DbSchemeMongoIndexesComponent,
    BorderedContainerComponent,
  ],
  imports: [
    CommonModule,
    MaterialComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    I18NextModule,
    DialogsModule,
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
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
    }),
  ],
  exports: [SqlPlaygroundComponent],
})
export class SqlPlaygroundModule {}

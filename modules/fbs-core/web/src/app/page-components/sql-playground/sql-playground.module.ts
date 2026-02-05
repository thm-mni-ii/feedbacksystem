import { NgModule } from "@angular/core";
import { SqlPlaygroundFeatureModule } from "../../features/sql-playground/sql-playground.module";

/**
 * SQL Playground Module (Temporary Re-export)
 * 
 * This module now simply re-exports the SqlPlaygroundFeatureModule.
 * It exists temporarily to maintain compatibility with app.module.ts imports.
 * 
 * In Step 6, this will be removed and app-routing.module.ts will be updated
 * to lazy-load the feature module directly.
 */

@NgModule({
  imports: [SqlPlaygroundFeatureModule],
  exports: [SqlPlaygroundFeatureModule],
})
export class SqlPlaygroundModule {}
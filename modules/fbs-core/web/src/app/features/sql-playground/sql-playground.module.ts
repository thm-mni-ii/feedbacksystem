import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SqlPlaygroundRoutingModule } from "./sql-playground-routing.module";

/**
 * SQL Playground Feature Module (Shell)
 * 
 * This is a placeholder module created in Step 2 of the refactoring process.
 * It will be populated with components, services, and state management in subsequent steps:
 * 
 * - Step 3: Models will be moved here
 * - Step 4: Services will be moved here
 * - Step 5: Components and NgRx state will be moved here
 * - Step 6: Dialogs will be moved and lazy loading will be enabled
 * 
 * Currently, this module does nothing and imports alongside the existing
 * SqlPlaygroundModule in app.module.ts to ensure the build remains stable.
 */

@NgModule({
  declarations: [
    // Components will be added in Step 5
  ],
  imports: [
    CommonModule,
    SqlPlaygroundRoutingModule,
    // Additional imports will be added as code is migrated
  ],
  providers: [
    // Services will be provided here in Step 4 (or use providedIn: 'root')
  ],
})
export class SqlPlaygroundFeatureModule {}

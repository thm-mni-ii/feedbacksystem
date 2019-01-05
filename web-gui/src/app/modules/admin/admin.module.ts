import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AdminRoutingModule} from './admin-routing.module';
import {AdminStartComponent} from './admin-start/admin-start.component';
import {AdminDashboardComponent} from './admin-dashboard/admin-dashboard.component';
import {LayoutModule} from '@angular/cdk/layout';
import {AdminNavComponent} from './admin-nav/admin-nav.component';
import {AdminUserManagementComponent} from './admin-user-management/admin-user-management.component';
import {MaterialComponentsModule} from "../material-components/material-components.module";

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    LayoutModule,
    MaterialComponentsModule
  ],
  declarations: [AdminStartComponent, AdminDashboardComponent, AdminNavComponent, AdminUserManagementComponent]
})
export class AdminModule { }

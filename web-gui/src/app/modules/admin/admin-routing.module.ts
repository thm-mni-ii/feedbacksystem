import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminStartComponent} from "./admin-start/admin-start.component";
import {AdminDashboardComponent} from "./admin-dashboard/admin-dashboard.component";
import {AdminUserManagementComponent} from "./admin-user-management/admin-user-management.component";

const routes: Routes = [
  {
    path: '', component: AdminStartComponent, children: [
      {path: 'dashboard', component: AdminDashboardComponent},
      {path: 'user-management', component: AdminUserManagementComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AdminStartComponent} from "./admin-start/admin-start.component";

const routes: Routes = [
  {path: '', component: AdminStartComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

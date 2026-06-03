import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SqlPlaygroundComponent } from './features/sql-playground/sql-playground.component';

const routes: Routes = [
  { path: '', redirectTo: 'playground', pathMatch: 'full' },
  { path: 'playground', component: SqlPlaygroundComponent },
  { path: '**', redirectTo: 'playground' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

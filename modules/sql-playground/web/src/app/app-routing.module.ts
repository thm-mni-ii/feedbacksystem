import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SqlPlaygroundPageComponent } from './sql-playground-page/sql-playground-page.component';

const routes: Routes = [
  { path: '', redirectTo: 'playground', pathMatch: 'full' },
  { path: 'playground', component: SqlPlaygroundPageComponent },
  { path: '**', redirectTo: 'playground' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

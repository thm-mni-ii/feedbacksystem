import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ProfStartComponent} from "./prof-start/prof-start.component";

const routes: Routes = [
  {path: '', component: ProfStartComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfessorRoutingModule {
}

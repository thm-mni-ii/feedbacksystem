import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ModeratorStartComponent} from "./moderator-start/moderator-start.component";

const routes: Routes = [
  {path: '', component: ModeratorStartComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModeratorRoutingModule {
}

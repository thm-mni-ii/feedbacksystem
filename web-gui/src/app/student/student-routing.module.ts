import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {StudentStartComponent} from "./student-start/student-start.component";

const routes: Routes = [
  {path: '', component: StudentStartComponent},
  {path: 'test', component: StudentStartComponent, outlet: 'content'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }

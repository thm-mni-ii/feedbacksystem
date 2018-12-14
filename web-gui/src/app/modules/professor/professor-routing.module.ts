import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ProfStartComponent} from "./prof-start/prof-start.component";
import {ProfCoursesComponent} from "./prof-courses/prof-courses.component";

const routes: Routes = [
  {
    path: '', component: ProfStartComponent, children: [
      {path: 'courses', component: ProfCoursesComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfessorRoutingModule {
}

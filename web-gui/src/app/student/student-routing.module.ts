import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {StudentStartComponent} from "./student-start/student-start.component";
import {StudentSearchComponent} from "./student-search/student-search.component";
import {StudentCourseComponent} from "./student-course/student-course.component";

const routes: Routes = [
  {path: '', component: StudentStartComponent},
  {path: 'search', component: StudentSearchComponent},
  {path: 'course/:id', component: StudentCourseComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule {
}

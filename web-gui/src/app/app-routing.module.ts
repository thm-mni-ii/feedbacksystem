import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {LoginComponent} from "./login/login.component";


const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'user', loadChildren: './student/student.module#StudentModule'},
  {path: 'admin', loadChildren: './admin/admin.module#AdminModule'},
  {path: 'prof', loadChildren: './professor/professor.module#ProfessorModule'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes,{enableTracing: true})
  ],
  exports: [
    RouterModule
  ],
})
export class AppRoutingModule {
}

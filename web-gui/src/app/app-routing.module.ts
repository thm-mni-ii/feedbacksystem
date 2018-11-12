import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {LoginComponent} from "./login/login.component";
import {AuthGuard} from "./guards/auth.guard";


const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'user', loadChildren: './student/student.module#StudentModule', canActivate: [AuthGuard]},
  {path: 'admin', loadChildren: './admin/admin.module#AdminModule', canActivate: [AuthGuard]},
  {path: 'prof', loadChildren: './professor/professor.module#ProfessorModule', canActivate: [AuthGuard]}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {enableTracing: false})
  ],
  exports: [
    RouterModule
  ],
})
export class AppRoutingModule {
}

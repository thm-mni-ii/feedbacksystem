import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {LoginComponent} from "./components/login/login.component";
import {AuthGuard} from "./guards/auth.guard";


const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'user', loadChildren: './modules/student/student.module#StudentModule', canActivate: [AuthGuard]},
  {path: 'admin', loadChildren: './modules/admin/admin.module#AdminModule', canActivate: [AuthGuard]},
  {path: 'prof', loadChildren: './modules/professor/professor.module#ProfessorModule', canActivate: [AuthGuard]}
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

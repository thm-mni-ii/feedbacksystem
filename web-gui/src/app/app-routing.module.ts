import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {AuthGuard} from './guards/auth.guard';
import {AdminDashboardComponent} from './components/admin/admin-dashboard/admin-dashboard.component';
import {AdminUserManagementComponent} from './components/admin/admin-user-management/admin-user-management.component';
import {StudentDashboardComponent} from './components/student/student-dashboard/student-dashboard.component';
import {StartComponent} from './components/start/start.component';
import {AdminCheckerComponent} from './components/admin/admin-checker/admin-checker.component';
import {CoursesComponent} from './components/courses/courses.component';
import {GrantDocentComponent} from './components/courses/grant-docent/grant-docent.component';
import {GrantTutorComponent} from './components/courses/grant-tutor/grant-tutor.component';
import {NewCourseComponent} from './components/courses/new-course/new-course.component';
import {SearchCourseComponent} from './components/courses/search-course/search-course.component';
import {DetailCourseComponent} from './components/courses/detail-course/detail-course.component';
import {ProfDashboardComponent} from './components/professor/prof-dashboard/prof-dashboard.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {
    path: '', component: StartComponent, canActivate: [AuthGuard], children: [

      {path: 'courses/user', component: CoursesComponent},
      {path: 'courses/docent', component: GrantDocentComponent},
      {path: 'courses/tutor', component: GrantTutorComponent},
      {path: 'courses/new', component: NewCourseComponent},
      {path: 'courses/search', component: SearchCourseComponent},
      {path: 'courses/:id', component: DetailCourseComponent},

      // Admin
      {path: 'admin/dashboard', component: AdminDashboardComponent},
      {path: 'admin/user-management', component: AdminUserManagementComponent},
      {path: 'admin/checker', component: AdminCheckerComponent},

      // Student
      {path: 'student/dashboard', component: StudentDashboardComponent},

      // Prof
      {path: 'docent/dashboard', component: ProfDashboardComponent}
    ]
  },
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

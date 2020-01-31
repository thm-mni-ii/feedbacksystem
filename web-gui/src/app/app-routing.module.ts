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
import {ModeratorGuard} from './guards/moderator.guard';
import {DocentGuard} from './guards/docent.guard';
import {AdminGuard} from './guards/admin.guard';
import {IsDocentGuard} from './guards/is-docent.guard';
import {NotFound404Component} from "./components/not-found404/not-found404.component";
import {ConnectedSystemsComponent} from "./components/connected-systems/connected-systems.component";
import {ImportCourseComponent} from "./components/courses/import-course/import-course.component";
import {ChangePasswdComponent} from "./components/users/change-passwd/change-passwd.component";
import {GuestGuard} from "./guards/guest.guard";
import {CourseResultDetailsComponent} from "./components/courses/course-result-details/course-result-details.component";
import {TaskAnalyzeSubmissionsComponent} from "./components/courses/task-analyze-submissions/task-analyze-submissions.component";
import {CourseProfDetailsComponent} from "./components/courses/detail-course/course-prof-details/course-prof-details.component";
import {IsGeqDocentGuard} from "./guards/is-geq-docent";
import {isGeneratedFile} from "@angular/compiler/src/aot/util";


const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {
    path: '', component: StartComponent, canActivate: [AuthGuard], children: [

      {path: 'courses/user', component: CoursesComponent},
      {path: 'courses/docent', component: GrantDocentComponent, canActivate: [ModeratorGuard]},
      {path: 'courses/tutor', component: GrantTutorComponent, canActivate: [DocentGuard]},
      {path: 'courses/new', component: NewCourseComponent, canActivate: [ModeratorGuard]},
      {path: 'courses/search', component: SearchCourseComponent},
      {path: 'courses/import', component: ImportCourseComponent, canActivate: [DocentGuard]},
      {path: 'courses/:id', component: DetailCourseComponent},
      {path: 'courses/:id/result', component: CourseResultDetailsComponent},
      {path: 'courses/:id/task/:taskid/analyze', component: TaskAnalyzeSubmissionsComponent},

      // Admin
      {path: 'admin/dashboard', component: ProfDashboardComponent, canActivate: [AdminGuard]},
      {path: 'admin/user-management', component: AdminUserManagementComponent, canActivate: [AdminGuard]},
      {path: 'admin/checker', component: AdminCheckerComponent, canActivate: [AdminGuard]},
      {path: 'admin/testsystems', component: ConnectedSystemsComponent, canActivate: [AdminGuard]},

      // Users self settings
      {path: 'users/passwd', component: ChangePasswdComponent, canActivate: [GuestGuard]},

      // Student
      {path: 'student/dashboard', component: StudentDashboardComponent},

      // Prof
      {path: 'docent/dashboard', component: ProfDashboardComponent, canActivate: [IsDocentGuard]},
      {path: 'docent/dashboard/task/:taskid/user/:userid', component: CourseProfDetailsComponent, canActivate: [IsGeqDocentGuard]},

      //General Sites
      {path: '404', component: NotFound404Component},

    ]
  },
  { path: '**', redirectTo: '404' }
];

/**
 * Routing of angular app
 */
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

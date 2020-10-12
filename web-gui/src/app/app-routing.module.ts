import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './guards/auth.guard';
import {DocentGuard} from './guards/docent.guard';
import {AdminGuard} from './guards/admin.guard';
import {ChangePasswordComponent} from "./page-components/change-password/change-password.component";
import {MyCoursesComponent} from "./page-components/my-courses/my-courses.component";
import {SearchCoursesComponent} from "./page-components/search-courses/search-courses.component";
import {ImportCourseComponent} from "./page-components/import-course/import-course.component";
import {CourseDetailComponent} from "./page-components/course-detail/course-detail.component";
import {ConferenceComponent} from "./page-components/conference/conference.component";
import {UserManagementComponent} from "./page-components/user-management/user-management.component";
import {NotFoundComponent} from "./page-components/not-found/not-found.component";
import {LoginComponent} from "./page-components/login/login.component";
import {SidebarComponent} from "./page-components/sidebar/sidebar.component";
import {TaskDetailComponent} from "./page-components/task-detail/task-detail.component";
import {CourseResultsComponent} from "./page-components/course-detail/course-results/course-results.component";
import {ConfigurationListComponent} from "./page-components/configuration-list/configuration-list.component";
import {ParticipantsComponent} from "./tool-components/participants/participants.component";

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {
    path: '', component: SidebarComponent, canActivate: [AuthGuard], children: [
      {path: 'courses', component: MyCoursesComponent, canActivate: [AuthGuard]},
      {path: 'courses/search', component: SearchCoursesComponent, canActivate: [AuthGuard]},
      {path: 'courses/import', component: ImportCourseComponent, canActivate: [DocentGuard]},
      {path: 'courses/:id', component: CourseDetailComponent, canActivate: [AuthGuard]},
      {path: 'courses/:id/tickets', component: ConferenceComponent, canActivate: [AuthGuard]},
      {path: 'courses/:id/task/:tid', component: TaskDetailComponent, canActivate: [AuthGuard]},
      {path: 'courses/:id/results', component: CourseResultsComponent, canActivate: [AuthGuard]},
      {path: 'courses/:id/tasks/:tid/configurations', component: ConfigurationListComponent, canActivate: [AuthGuard]},
      {path: 'courses/:id/results', component: CourseResultsComponent, canActivate: [AuthGuard]},
      {path: 'courses/:id/participants', component: ParticipantsComponent, canActivate: [AuthGuard]},

      // Admin
      {path: 'admin/user-management', component: UserManagementComponent, canActivate: [AdminGuard]},
      //{path: 'admin/checker', component: AdminCheckerComponent, canActivate: [AdminGuard]},
      // {path: 'admin/testsystems', component: ConnectedSystemsComponent, canActivate: [AdminGuard]},
      // {path: 'admin/settings', component: AdminSettingsComponent, canActivate: [AdminGuard]},

      // Users self settings
      {path: 'users/password', component: ChangePasswordComponent, canActivate: [AuthGuard]},

      // Student
      //{path: 'student/dashboard', component: StudentDashboardComponent},

      // Prof
      //{path: 'docent/dashboard', component: ProfDashboardComponent, canActivate: [IsDocentGuard]},
      //{path: 'docent/dashboard/task/:taskid/user/:userid', component: CourseProfDetailsComponent, canActivate: [IsGeqDocentGuard]},

      // General Sites
      {path: '404', component: NotFoundComponent},
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

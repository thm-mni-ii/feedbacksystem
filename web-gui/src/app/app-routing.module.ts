import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AuthGuard} from './guards/auth.guard';
import {IsDocentGuard} from './guards/is-docent.guard';
import {GuestGuard} from './guards/guest.guard';
import {IsGeqDocentGuard} from './guards/is-geq-docent';
import {ModeratorGuard} from './guards/moderator.guard';
import {DocentGuard} from './guards/docent.guard';
import {AdminGuard} from './guards/admin.guard';

import {ChangePasswordComponent} from "./page-components/change-password/change-password.component";
import {MyCoursesComponent} from "./page-components/my-courses/my-courses.component";
import {CourseAuthorizationComponent} from "./page-components/course-authorization/course-authorization.component";
import {NewCourseComponent} from "./page-components/new-course/new-course.component";
import {SearchCoursesComponent} from "./page-components/search-courses/search-courses.component";
import {ImportCourseComponent} from "./page-components/import-course/import-course.component";
import {CourseDetailComponent} from "./page-components/course-detail/course-detail.component";
import {ConferenceComponent} from "./page-components/conference/conference.component";
import {UserManagementComponent} from "./page-components/user-management/user-management.component";
import {NotFoundComponent} from "./page-components/not-found/not-found.component";
import {LoginComponent} from "./page-components/login/login.component";
import {SidebarComponent} from "./page-components/sidebar/sidebar.component";
import {TaskDetailComponent} from "./page-components/task-detail/task-detail.component";

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {
    path: '', component: SidebarComponent, canActivate: [AuthGuard], children: [
      {path: 'courses', component: MyCoursesComponent},
      {path: 'courses/authorization', component: CourseAuthorizationComponent, canActivate: [ModeratorGuard]},
      {path: 'courses/new', component: NewCourseComponent, canActivate: [ModeratorGuard]},
      {path: 'courses/search', component: SearchCoursesComponent},
      {path: 'courses/import', component: ImportCourseComponent, canActivate: [DocentGuard]},
      {path: 'courses/:id', component: CourseDetailComponent},
      {path: 'courses/:id/tickets', component: ConferenceComponent},
      {path: 'courses/:id/task/:taskid', component: TaskDetailComponent},

      // Admin
      {path: 'admin/user-management', component: UserManagementComponent, canActivate: [AdminGuard]},
      //{path: 'admin/checker', component: AdminCheckerComponent, canActivate: [AdminGuard]},
      // {path: 'admin/testsystems', component: ConnectedSystemsComponent, canActivate: [AdminGuard]},
      // {path: 'admin/settings', component: AdminSettingsComponent, canActivate: [AdminGuard]},

      // Users self settings
      {path: 'users/password', component: ChangePasswordComponent, canActivate: [GuestGuard]},

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

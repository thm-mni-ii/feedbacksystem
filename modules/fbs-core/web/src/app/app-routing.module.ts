import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth.guard";
import { AdminGuard } from "./guards/admin.guard";
import { ChangePasswordComponent } from "./page-components/change-password/change-password.component";
import { MyCoursesComponent } from "./page-components/my-courses/my-courses.component";
import { SearchCoursesComponent } from "./page-components/search-courses/search-courses.component";
import { CourseDetailComponent } from "./page-components/course-detail/course-detail.component";
import { MyGroupsComponent } from "./page-components/my-groups/my-groups.component";
import { UserManagementComponent } from "./page-components/user-management/user-management.component";
import { NotFoundComponent } from "./page-components/not-found/not-found.component";
import { LoginComponent } from "./page-components/login/login.component";
import { SidebarComponent } from "./page-components/sidebar/sidebar.component";
import { TaskDetailComponent } from "./page-components/task-detail/task-detail.component";
import { CourseResultsComponent } from "./page-components/course-detail/course-results/course-results.component";
import { ConfigurationListComponent } from "./page-components/configuration-list/configuration-list.component";
import { ParticipantsComponent } from "./tool-components/participants/participants.component";
import { GoToComponent } from "./page-components/goto/goto.component";
import { SqlCheckerComponent } from "./page-components/sql-checker/sql-checker.component";
import { SqlCheckerResultsComponent } from "./page-components/sql-checker/sql-checker-results/sql-checker-results.component";
import { SqlPlaygroundComponent } from "./page-components/sql-playground/sql-playground.component";
import { AnalyticsToolComponent } from "./page-components/analytics-tool/analytics-tool.component";
import { FbsModellingComponent } from "./page-components/fbs-modelling/fbs-modelling.component";
import { GroupDetailComponent } from "./page-components/group-detail/group-detail.component";

const routes: Routes = [
  { path: "login", component: LoginComponent },
  {
    path: "",
    component: SidebarComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "courses",
        component: MyCoursesComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "courses/search",
        component: SearchCoursesComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "courses/:id",
        component: CourseDetailComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "courses/:id/task/:tid",
        component: TaskDetailComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "courses/:id/results",
        component: CourseResultsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "courses/:id/tasks/:tid/configurations",
        component: ConfigurationListComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "courses/:id/participants",
        component: ParticipantsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "courses/:id/sql-checker",
        component: SqlCheckerComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "courses/:id/sql-checker-results/:tid",
        component: SqlCheckerResultsComponent,
        canActivate: [AuthGuard],
      },

      //groups
      {
        path: "groups",
        component: MyGroupsComponent,
        canActivate: [AuthGuard],
      },

      {
        path: "groups/:courseId/:id",
        component: GroupDetailComponent,
        canActivate: [AuthGuard],
      },

      //sql playground
      {
        path: "sqlplayground",
        component: SqlPlaygroundComponent,
        canActivate: [AuthGuard],
      },

      // Analytics
      {
        path: "analytics",
        component: AnalyticsToolComponent,
        canActivate: [AuthGuard],
      },
      // Modelling
      {
        path: "modelling",
        component: FbsModellingComponent,
        canActivate: [AuthGuard],
      },

      // Admin
      {
        path: "admin/user-management",
        component: UserManagementComponent,
        canActivate: [AdminGuard],
      },

      // Users self settings
      {
        path: "users/password",
        component: ChangePasswordComponent,
        canActivate: [AuthGuard],
      },

      // General Sites
      { path: "404", component: NotFoundComponent },

      // Redirect `/` to courses
      { path: "", redirectTo: "courses", pathMatch: "full" },
    ],
  },
  // Goto
  { path: "go/:id", component: GoToComponent },
  { path: "go/:id/:target", component: GoToComponent },

  { path: "**", redirectTo: "404" },
];

/**
 * Routing of angular app
 */
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false,
      relativeLinkResolution: "legacy",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

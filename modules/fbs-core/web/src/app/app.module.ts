import { BrowserModule } from "@angular/platform-browser";
import { MatDialogModule } from "@angular/material/dialog";
import { CUSTOM_ELEMENTS_SCHEMA, Injectable, NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { LayoutModule } from "@angular/cdk/layout";
import { AppRoutingModule } from "./app-routing.module";
import { LoginComponent } from "./page-components/login/login.component";
import { MaterialComponentsModule } from "./modules/material-components/material-components.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { JwtModule } from "@auth0/angular-jwt";
import { Observable } from "rxjs";
import { DataprivacyDialogComponent } from "./dialogs/dataprivacy-dialog/dataprivacy-dialog.component";
import { ImpressumDialogComponent } from "./dialogs/impressum-dialog/impressum-dialog.component";
import { CookieService } from "ngx-cookie-service";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MarkdownModule } from "ngx-markdown";
import { NgxDropzoneModule } from "ngx-dropzone";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSliderModule } from "@angular/material/slider";
import { MatTabsModule } from "@angular/material/tabs";

import { NewCourseComponent } from "./page-components/new-course/new-course.component";
import { SearchCoursesComponent } from "./page-components/search-courses/search-courses.component";
import { CoursePreviewComponent } from "./page-components/course-preview/course-preview.component";
import { CoursePreviewWProgressComponent } from "./page-components/course-preview/course-preview-w-progress.component";
import { CourseDetailComponent } from "./page-components/course-detail/course-detail.component";
import { TaskDetailComponent } from "./page-components/task-detail/task-detail.component";
import { UserManagementComponent } from "./page-components/user-management/user-management.component";
import { ChangePasswordComponent } from "./page-components/change-password/change-password.component";
import { AllSubmissionsComponent } from "./dialogs/all-submissions/all-submissions.component";
import { CourseResultsComponent } from "./page-components/course-detail/course-results/course-results.component";
import { TaskPreviewComponent } from "./page-components/course-detail/task-preview/task-preview.component";
import { SubmissionFileComponent } from "./page-components/task-detail/submission-file/submission-file.component";
import { SubmissionTextComponent } from "./page-components/task-detail/submission-text/submission-text.component";
import { ResultsComponent } from "./page-components/results/results.component";
import { DropzoneComponent } from "./tool-components/dropzone/dropzone.component";
import { SidebarComponent } from "./page-components/sidebar/sidebar.component";
import { MyCoursesComponent } from "./page-components/my-courses/my-courses.component";
import { NotFoundComponent } from "./page-components/not-found/not-found.component";
import { TaskNewDialogComponent } from "./dialogs/task-new-dialog/task-new-dialog.component";
import { CourseUpdateDialogComponent } from "./dialogs/course-update-dialog/course-update-dialog.component";
import { CreateGuestUserDialogComponent } from "./dialogs/create-guest-user-dialog/create-guest-user-dialog.component";
import { UserTeacherFilter } from "./pipes/user-teacher-filter";
import { ParticipantsComponent } from "./tool-components/participants/participants.component";
import { ConfigurationListComponent } from "./page-components/configuration-list/configuration-list.component";
import { MenuBarComponent } from "./tool-components/menu-bar/menu-bar.component";
import { NewCheckerDialogComponent } from "./dialogs/new-checker-dialog/new-checker-dialog.component";
import { ConfirmDialogComponent } from "./dialogs/confirm-dialog/confirm-dialog.component";
import { TextConfirmDialogComponent } from "./dialogs/text-confirm-dialog/text-confirm-dialog.component";
import { NewDbDialogComponent } from "./dialogs/new-db-dialog/new-db-dialog.component";

import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from "@angular-material-components/datetime-picker";
import { InfoComponent } from "./tool-components/info/info.component";
import { tap } from "rxjs/operators";
import { AuthService } from "./service/auth.service";
import { ReversePipe } from "./pipes/reverse.pipe";
import { TaskPointsDialogComponent } from "./dialogs/task-points-dialog/task-points-dialog.component";
import { GoToComponent } from "./page-components/goto/goto.component";
import { GotoLinksDialogComponent } from "./dialogs/goto-links-dialog/goto-links-dialog.component";
import { EvaluationResultsComponent } from "./page-components/course-detail/course-results/evaluation-results/evaluation-results.component";
import { SubmissionSpreadsheetComponent } from "./page-components/task-detail/submission-spreadsheet/submission-spreadsheet.component";
import { SpreadsheetComponent } from "./dialogs/spreadsheet-dialog/spreadsheet/spreadsheet.component";
import { SpreadsheetDialogComponent } from "./dialogs/spreadsheet-dialog/spreadsheet-dialog.component";
import { SubtaskResultsComponent } from "./page-components/subtask-results/subtask-results.component";
import { ChartsModule } from "ng2-charts";
import { ResultsStatisticComponent } from "./page-components/course-detail/course-results/results-statistic/results-statistic.component";
import { SqlCheckerComponent } from "./page-components/sql-checker/sql-checker.component";
import { SqlCheckerResultsComponent } from "./page-components/sql-checker/sql-checker-results/sql-checker-results.component";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { SqlPlaygroundComponent } from "./page-components/sql-playground/sql-playground.component";
import { AnalyticsToolComponent } from "./page-components/analytics-tool/analytics-tool.component";
import { BorderedContainerComponent } from "./page-components/bordered-container/bordered-container.component";
import { DynamicResultTableComponent } from "./page-components/sql-playground/dynamic-result-table/dynamic-result-table.component";
import { DbControlPanelComponent } from "./page-components/sql-playground/db-control-panel/db-control-panel.component";
import { SqlInputTabsComponent } from "./page-components/sql-playground/sql-input-tabs/sql-input-tabs.component";
import { DbSchemeComponent } from "./page-components/sql-playground/db-scheme/db-scheme.component";
import { DbSchemeViewsComponent } from "./page-components/sql-playground/db-scheme/db-scheme-views/db-scheme-views.component";
import { DbSchemeTriggersComponent } from "./page-components/sql-playground/db-scheme/db-scheme-triggers/db-scheme-triggers.component";
import { DbSchemeRoutinesComponent } from "./page-components/sql-playground/db-scheme/db-scheme-routines/db-scheme-routines.component";
import { DbSchemeTablesComponent } from "./page-components/sql-playground/db-scheme/db-scheme-tables/db-scheme-tables.component";
import { DbControlTemplatesComponent } from "./page-components/sql-playground/db-control-panel/db-control-templates/db-control-templates.component";
import { DbControlCoWorkingComponent } from "./page-components/sql-playground/db-control-panel/db-control-co-working/db-control-co-working.component";
import { DbControlDbOverviewComponent } from "./page-components/sql-playground/db-control-panel/db-control-db-overview/db-control-db-overview.component";
import { NewSqlTemplateComponent } from "./dialogs/new-sql-template/new-sql-template.component";
import { ExportTasksDialogComponent } from "./dialogs/export-tasks-dialog/export-tasks-dialog.component";
import { HighlightedInputComponent } from "./page-components/sql-playground/sql-input-tabs/highlighted-input/highlighted-input.component";

import "mathlive";
import "@cortex-js/compute-engine";
import { MathInputComponent } from "./tool-components/math-input/math-input.component";
import { FbsModellingComponent } from './page-components/fbs-modelling/fbs-modelling.component';

@Injectable()
export class ApiURIHttpInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  public intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const clonedRequest: HttpRequest<any> = req.clone({
      // url: (req.url.search('localhost') >= 0) ? req.url : 'https://localhost'  + req.url // 'https://fk-server.mni.thm.de'
      // url: 'https://feedback.mni.thm.de/'  + req.url // 'https://fk-server.mni.thm.de'
    });

    return next.handle(clonedRequest).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          const response = <HttpResponse<any>>event;
          this.authService.renewToken(response);
        }
      })
    );
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: ApiURIHttpInterceptor, multi: true },
];

/**
 * Root module to manage angular app
 */
@NgModule({
  declarations: [
    AppComponent,
    CreateGuestUserDialogComponent,
    SidebarComponent,
    NewCourseComponent,
    DataprivacyDialogComponent,
    ImpressumDialogComponent,
    NotFoundComponent,
    ChangePasswordComponent,
    UserTeacherFilter,
    SearchCoursesComponent,
    CoursePreviewComponent,
    CoursePreviewWProgressComponent,
    CourseDetailComponent,
    TaskDetailComponent,
    UserManagementComponent,
    AllSubmissionsComponent,
    CourseResultsComponent,
    TaskPreviewComponent,
    SubmissionFileComponent,
    SubmissionTextComponent,
    SubmissionSpreadsheetComponent,
    ResultsComponent,
    MyCoursesComponent,
    LoginComponent,
    TaskNewDialogComponent,
    CourseUpdateDialogComponent,
    DropzoneComponent,
    ParticipantsComponent,
    ConfigurationListComponent,
    MenuBarComponent,
    NewCheckerDialogComponent,
    ConfirmDialogComponent,
    InfoComponent,
    ReversePipe,
    GoToComponent,
    TaskPointsDialogComponent,
    EvaluationResultsComponent,
    GotoLinksDialogComponent,
    SpreadsheetComponent,
    SpreadsheetDialogComponent,
    SubtaskResultsComponent,
    ResultsStatisticComponent,
    SqlCheckerComponent,
    SqlCheckerResultsComponent,
    TextConfirmDialogComponent,
    SqlPlaygroundComponent,
    AnalyticsToolComponent,
    BorderedContainerComponent,
    DynamicResultTableComponent,
    DbControlPanelComponent,
    SqlInputTabsComponent,
    DbSchemeComponent,
    DbSchemeViewsComponent,
    DbSchemeTriggersComponent,
    DbSchemeRoutinesComponent,
    DbSchemeTablesComponent,
    NewDbDialogComponent,
    DbControlTemplatesComponent,
    DbControlCoWorkingComponent,
    DbControlDbOverviewComponent,
    NewSqlTemplateComponent,
    ExportTasksDialogComponent,
    HighlightedInputComponent,
    MathInputComponent,
    FbsModellingComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    LayoutModule,
    AppRoutingModule,
    MaterialComponentsModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MarkdownModule.forRoot(),
    MatDatepickerModule,
    MatTabsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
      },
    }),
    NgxDropzoneModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatProgressBarModule,
    MatGridListModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSliderModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    ChartsModule,
    MatTableModule,
    MatSortModule,
  ],
  entryComponents: [
    DataprivacyDialogComponent,
    CreateGuestUserDialogComponent,
    ImpressumDialogComponent,
  ],
  providers: [
    CookieService,
    httpInterceptorProviders,
    {
      provide: MAT_DATE_FORMATS,
      useValue: { parse: { dateInput: ["L"] }, display: { dateInput: "L" } },
    },
    { provide: MAT_DATE_LOCALE, useValue: "de" },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}

export function tokenGetter() {
  return localStorage.getItem("token");
}

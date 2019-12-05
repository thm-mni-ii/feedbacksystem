import {BrowserModule} from '@angular/platform-browser';
import {Injectable, NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LayoutModule} from '@angular/cdk/layout';
import {AppRoutingModule} from './app-routing.module';
import {LoginComponent} from './components/login/login.component';
import {MaterialComponentsModule} from './modules/material-components/material-components.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {JwtModule} from '@auth0/angular-jwt';
import {Observable} from 'rxjs';
import {AdminUserManagementComponent} from './components/admin/admin-user-management/admin-user-management.component';
import {AdminDashboardComponent} from './components/admin/admin-dashboard/admin-dashboard.component';
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
import {ReadMoreComponent} from './components/courses/search-course/read-more/read-more.component';
import {NewtaskDialogComponent} from './components/courses/detail-course/newtask-dialog/newtask-dialog.component';
import {ExitCourseComponent} from './components/courses/detail-course/exit-course/exit-course.component';
import {UpdateCourseDialogComponent} from './components/courses/detail-course/update-course-dialog/update-course-dialog.component';
import {DataprivacyDialogComponent} from './components/dataprivacy-dialog/dataprivacy-dialog.component';
import {ImpressumDialogComponent} from './components/impressum-dialog/impressum-dialog.component';
import {CookieService} from 'ngx-cookie-service';
import {MarkdownModule, MarkdownService, MarkedOptions} from 'ngx-markdown';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import { DeleteCourseModalComponent } from './components/courses/modals/delete-course-modal/delete-course-modal.component';
import { GrantTutorSnippComponent } from './components/courses/grant-tutor-snipp/grant-tutor-snipp.component';
import { GrantDocentSnippComponent } from './components/courses/grant-docent-snipp/grant-docent-snipp.component';
import { DeleteTaskModalComponent } from './components/courses/modals/delete-task-modal/delete-task-modal.component';
import { DeleteUserModalComponent } from './components/modals/delete-user-modal/delete-user-modal.component';
import { AnswerFromTestsystemDialogComponent } from './components/courses/modals/answer-from-testsystem-dialog/answer-from-testsystem-dialog.component';
import { NotFound404Component } from './components/not-found404/not-found404.component';
import { UploadPlagiatScriptComponent } from './components/courses/modals/upload-plagiat-script/upload-plagiat-script.component';
import {CourseParameterModalComponent} from "./components/courses/detail-course/course-parameter-modal/course-parameter-modal.component";
import {CourseParameterUserModalComponent} from "./components/courses/detail-course/course-parameter-user-modal/course-parameter-user-modal.component";
import {NgxDropzoneModule} from "ngx-dropzone";
import { ConnectedSystemsComponent } from './components/connected-systems/connected-systems.component';
import { EditTestsystemsModalComponent } from './components/connected-systems/modals/edit-testsystems-modal/edit-testsystems-modal.component';
import { DeleteTestsystemAskModalComponent } from './components/connected-systems/modals/delete-testsystem-ask-modal/delete-testsystem-ask-modal.component';
import { TaskResultComponent } from './components/courses/detail-course/task-result/task-result.component';
import {MatSlideToggleModule} from "@angular/material";
import { ImportCourseComponent } from './components/courses/import-course/import-course.component';
import { ChangePasswdComponent } from './components/users/change-passwd/change-passwd.component';
import { CourseResultDetailsComponent } from './components/courses/course-result-details/course-result-details.component';
import { CourseResultDetailTableComponent } from './components/courses/course-result-detail-table/course-result-detail-table.component';


@Injectable()
export class ApiURIHttpInterceptor implements HttpInterceptor {
  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const clonedRequest: HttpRequest<any> = req.clone({
      url: (req.url.search('localhost') >= 0) ? req.url : 'https://localhost:8080'  + req.url // 'https://fk-server.mni.thm.de'
    });

    return next.handle(clonedRequest);
  }
}

export const httpInterceptorProviders = [
  {provide: HTTP_INTERCEPTORS, useClass: ApiURIHttpInterceptor, multi: true}
];

/**
 * Root module to manage angular app
 */
@NgModule({
  declarations: [
    AppComponent,
    AdminUserManagementComponent,
    AdminDashboardComponent,
    AdminCheckerComponent,
    LoginComponent,
    StudentDashboardComponent,
    StartComponent,
    CoursesComponent,
    GrantDocentComponent,
    GrantTutorComponent,
    NewCourseComponent,
    SearchCourseComponent,
    DetailCourseComponent,
    ProfDashboardComponent,
    ReadMoreComponent,
    NewtaskDialogComponent,
    ExitCourseComponent,
    UpdateCourseDialogComponent,
    DataprivacyDialogComponent,
    ImpressumDialogComponent,
    DeleteCourseModalComponent,
    GrantTutorSnippComponent,
    GrantDocentSnippComponent,
    DeleteTaskModalComponent,
    DeleteUserModalComponent,
    AnswerFromTestsystemDialogComponent,
    NotFound404Component,
    ConnectedSystemsComponent,
    CourseParameterModalComponent,
    CourseParameterUserModalComponent,
    UploadPlagiatScriptComponent,
    EditTestsystemsModalComponent,
    DeleteTestsystemAskModalComponent,
    TaskResultComponent,
    ImportCourseComponent,
    ChangePasswdComponent,
    CourseResultDetailsComponent,
    CourseResultDetailTableComponent,
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
    MarkdownModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
      }
    }),
    NgxDropzoneModule,
    MatSlideToggleModule
  ],
  entryComponents: [NewtaskDialogComponent, ExitCourseComponent, UpdateCourseDialogComponent, DataprivacyDialogComponent,
    ImpressumDialogComponent, DeleteCourseModalComponent, DeleteUserModalComponent, DeleteTaskModalComponent, AnswerFromTestsystemDialogComponent,
    CourseParameterModalComponent,CourseParameterUserModalComponent, UploadPlagiatScriptComponent, EditTestsystemsModalComponent, DeleteTestsystemAskModalComponent],
  providers: [CookieService, MarkdownService, MarkedOptions],
  bootstrap: [AppComponent]
})
export class AppModule {
}

export function tokenGetter() {
  return localStorage.getItem('token');
}

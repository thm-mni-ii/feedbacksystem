import {BrowserModule} from '@angular/platform-browser';
import {MatDialogModule} from '@angular/material/dialog';
import {Injectable, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LayoutModule} from '@angular/cdk/layout';
import {AppRoutingModule} from './app-routing.module';
import {LoginComponent} from './page-components/login/login.component';
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
import {DataprivacyDialogComponent} from './dialogs/dataprivacy-dialog/dataprivacy-dialog.component';
import {ImpressumDialogComponent} from './dialogs/impressum-dialog/impressum-dialog.component';
import {CookieService} from 'ngx-cookie-service';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import {MarkdownModule} from 'ngx-markdown';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
//import { ImportCourseComponent } from './components/courses/import-course/import-course.component';
import { ImportCourseComponent } from "./page-components/import-course/import-course.component";
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { NewconferenceDialogComponent } from './dialogs/newconference-dialog/newconference-dialog.component';
//import { ConferenceComponent } from './components/courses/detail-course/conference/conference.component';
import {MatGridListModule} from '@angular/material/grid-list';
import { NewticketDialogComponent } from './dialogs/newticket-dialog/newticket-dialog.component';
import { IncomingCallDialogComponent } from './dialogs/incoming-call-dialog/incoming-call-dialog.component';
// tslint:disable-next-line:max-line-length
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSliderModule} from '@angular/material/slider';

import {NewCourseComponent} from "./page-components/new-course/new-course.component";
import { SearchCoursesComponent } from './page-components/search-courses/search-courses.component';
import { CoursePreviewComponent } from './page-components/course-preview/course-preview.component';
import { CourseDetailComponent } from './page-components/course-detail/course-detail.component';
import { TaskDetailComponent } from './page-components/task-detail/task-detail.component';
import { CourseAuthorizationComponent } from './page-components/course-authorization/course-authorization.component';
import { UserManagementComponent } from './page-components/user-management/user-management.component';
import { ChangePasswordComponent } from './page-components/change-password/change-password.component';
import { AllSubmissionsComponent } from './page-components/all-submissions/all-submissions.component';
import { CourseResultsComponent } from './page-components/course-detail/course-results/course-results.component';
import { TaskPreviewComponent } from './page-components/course-detail/task-preview/task-preview.component';
import { NewTaskComponent } from './page-components/course-detail/new-task/new-task.component';
import { SubmissionChoiceComponent } from './page-components/task-detail/submission-choice/submission-choice.component';
import { SubmissionFileComponent } from './page-components/task-detail/submission-file/submission-file.component';
import { SubmissionTextComponent } from './page-components/task-detail/submission-text/submission-text.component';
import { SubmissionResultComponent } from './page-components/task-detail/submission-result/submission-result.component';
import { DocentInCourseComponent } from './tool-components/docent-in-course/docent-in-course.component';
import { TutorInCourseComponent } from './tool-components/tutor-in-course/tutor-in-course.component';
import { SingleSubmissionComponent } from './page-components/single-submission/single-submission.component';
import { DropzoneComponent } from './tool-components/dropzone/dropzone.component';
import { SidebarComponent } from "./page-components/sidebar/sidebar.component";
import { MyCoursesComponent } from "./page-components/my-courses/my-courses.component";
import {ConferenceComponent} from "./page-components/conference/conference.component";
import { FilterPipe } from "./page-components/course-authorization/course-authorization.component";
import { NotFoundComponent } from "./page-components/not-found/not-found.component";
import {ParameterCourseModalComponent} from "./dialogs/parameter-course-modal/parameter-course-modal.component";
import {ParameterUserModalComponent} from "./dialogs/parameter-user-modal/parameter-user-modal.component";
import {CourseDeleteModalComponent} from "./dialogs/course-delete-modal/course-delete-modal.component";
import {TaskDeleteModalComponent} from "./dialogs/task-delete-modal/task-delete-modal.component";
import {UserDeleteModalComponent} from "./dialogs/user-delete-modal/user-delete-modal.component";
import {TaskNewDialogComponent} from "./dialogs/task-new-dialog/task-new-dialog.component";
import {CourseUpdateDialogComponent} from "./dialogs/course-update-dialog/course-update-dialog.component";
import {CreateGuestUserDialog} from "./dialogs/create-guest-user-dialog/create-guest-user-dialog.component";
import {ExitCourseDialogComponent} from "./dialogs/exit-course-dialog/exit-course-dialog.component";
import {InvitetoConferenceDialogComponent} from "./dialogs/inviteto-conference-dialog/inviteto-conference-dialog.component";
import {UserTeacherFilter} from "./pipes/user-teacher-filter";
import {AssignTicketDialogComponent} from "./dialogs/assign-ticket-dialog/assign-ticket-dialog.component";

@Injectable()
export class ApiURIHttpInterceptor implements HttpInterceptor {
  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const clonedRequest: HttpRequest<any> = req.clone({
      url: (req.url.search('localhost') >= 0) ? req.url : 'https://localhost'  + req.url // 'https://fk-server.mni.thm.de'
      // url: 'https://feedback.mni.thm.de/'  + req.url // 'https://fk-server.mni.thm.de'
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
    CreateGuestUserDialog,
    SidebarComponent,
    NewCourseComponent,
    ExitCourseDialogComponent,
    DataprivacyDialogComponent,
    ImpressumDialogComponent,
    NotFoundComponent,
    ImportCourseComponent,
    ChangePasswordComponent,
    NewconferenceDialogComponent,
    ConferenceComponent,
    FilterPipe,
    UserTeacherFilter,
    NewticketDialogComponent,
    IncomingCallDialogComponent,
    SearchCoursesComponent,
    CoursePreviewComponent,
    CourseDetailComponent,
    TaskDetailComponent,
    CourseAuthorizationComponent,
    UserManagementComponent,
    AllSubmissionsComponent,
    CourseResultsComponent,
    TaskPreviewComponent,
    NewTaskComponent,
    SubmissionChoiceComponent,
    SubmissionFileComponent,
    SubmissionTextComponent,
    SubmissionResultComponent,
    DocentInCourseComponent,
    TutorInCourseComponent,
    SingleSubmissionComponent,
    DropzoneComponent,
    MyCoursesComponent,
    ConferenceComponent,
    LoginComponent,
    ParameterCourseModalComponent,
    ParameterUserModalComponent,
    CourseDeleteModalComponent,
    TaskDeleteModalComponent,
    UserDeleteModalComponent,
    TaskNewDialogComponent,
    CourseUpdateDialogComponent,
    AssignTicketDialogComponent,
    InvitetoConferenceDialogComponent,
    DropzoneComponent,
    MyCoursesComponent,
    ConferenceComponent
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
    MatNativeDateModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
      }
    }),
    NgxDropzoneModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatProgressBarModule,
    MatGridListModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSliderModule
  ],
  entryComponents: [ExitCourseDialogComponent, DataprivacyDialogComponent, CreateGuestUserDialog, ImpressumDialogComponent,
    InvitetoConferenceDialogComponent, AssignTicketDialogComponent],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule {
}

export function tokenGetter() {
  return localStorage.getItem('token');
}

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
  HttpRequest, HttpResponse
} from '@angular/common/http';
import {JwtModule} from '@auth0/angular-jwt';
import {Observable} from 'rxjs';
import {DataprivacyDialogComponent} from './dialogs/dataprivacy-dialog/dataprivacy-dialog.component';
import {ImpressumDialogComponent} from './dialogs/impressum-dialog/impressum-dialog.component';
import {CookieService} from 'ngx-cookie-service';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MarkdownModule} from 'ngx-markdown';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { NewconferenceDialogComponent } from './dialogs/newconference-dialog/newconference-dialog.component';
import {MatGridListModule} from '@angular/material/grid-list';
import { NewticketDialogComponent } from './dialogs/newticket-dialog/newticket-dialog.component';
import { IncomingCallDialogComponent } from './dialogs/incoming-call-dialog/incoming-call-dialog.component';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSliderModule} from '@angular/material/slider';

import {NewCourseComponent} from './page-components/new-course/new-course.component';
import { SearchCoursesComponent } from './page-components/search-courses/search-courses.component';
import { CoursePreviewComponent} from './page-components/course-preview/course-preview.component';
import { CourseDetailComponent } from './page-components/course-detail/course-detail.component';
import { TaskDetailComponent } from './page-components/task-detail/task-detail.component';
import { UserManagementComponent } from './page-components/user-management/user-management.component';
import { ChangePasswordComponent } from './page-components/change-password/change-password.component';
import { AllSubmissionsComponent } from './dialogs/all-submissions/all-submissions.component';
import { CourseResultsComponent } from './page-components/course-detail/course-results/course-results.component';
import { TaskPreviewComponent } from './page-components/course-detail/task-preview/task-preview.component';
import { SubmissionFileComponent } from './page-components/task-detail/submission-file/submission-file.component';
import { SubmissionTextComponent } from './page-components/task-detail/submission-text/submission-text.component';
import { ResultsComponent } from './page-components/results/results.component';
import { DropzoneComponent } from './tool-components/dropzone/dropzone.component';
import { SidebarComponent } from './page-components/sidebar/sidebar.component';
import { MyCoursesComponent } from './page-components/my-courses/my-courses.component';
import {ConferenceComponent} from './page-components/conference/conference.component';
import { NotFoundComponent } from './page-components/not-found/not-found.component';
import {TaskNewDialogComponent} from './dialogs/task-new-dialog/task-new-dialog.component';
import {CourseUpdateDialogComponent} from './dialogs/course-update-dialog/course-update-dialog.component';
import {CreateGuestUserDialogComponent} from './dialogs/create-guest-user-dialog/create-guest-user-dialog.component';
import {InvitetoConferenceDialogComponent} from './dialogs/inviteto-conference-dialog/inviteto-conference-dialog.component';
import {UserTeacherFilter} from './pipes/user-teacher-filter';
import {AssignTicketDialogComponent} from './dialogs/assign-ticket-dialog/assign-ticket-dialog.component';
import { ParticipantsComponent } from './tool-components/participants/participants.component';
import { ConfigurationListComponent } from './page-components/configuration-list/configuration-list.component';
import { MenuBarComponent } from './tool-components/menu-bar/menu-bar.component';
import { NewCheckerDialogComponent } from './dialogs/new-checker-dialog/new-checker-dialog.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule
} from '@angular-material-components/datetime-picker';
import { InfoComponent } from './tool-components/info/info.component';
import { tap } from 'rxjs/operators';
import {AuthService} from './service/auth.service';
import { ReversePipe } from './pipes/reverse.pipe';
import { TaskPointsDialogComponent } from './dialogs/task-points-dialog/task-points-dialog.component';
import {GoToComponent} from './page-components/goto/goto.component';
import {GotoLinksDialogComponent} from './dialogs/goto-links-dialog/goto-links-dialog.component';
import { EvaluationResultsComponent } from './page-components/course-detail/course-results/evaluation-results/evaluation-results.component';

@Injectable()
export class ApiURIHttpInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const clonedRequest: HttpRequest<any> = req.clone({
      // url: (req.url.search('localhost') >= 0) ? req.url : 'https://localhost'  + req.url // 'https://fk-server.mni.thm.de'
      // url: 'https://feedback.mni.thm.de/'  + req.url // 'https://fk-server.mni.thm.de'
    });

    return next.handle(clonedRequest).pipe(tap(event => {
      if (event instanceof HttpResponse) {
        const response = <HttpResponse<any>>event;
        this.authService.renewToken(response);
      }
    }));
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
    CreateGuestUserDialogComponent,
    SidebarComponent,
    NewCourseComponent,
    DataprivacyDialogComponent,
    ImpressumDialogComponent,
    NotFoundComponent,
    ChangePasswordComponent,
    NewconferenceDialogComponent,
    ConferenceComponent,
    UserTeacherFilter,
    NewticketDialogComponent,
    IncomingCallDialogComponent,
    SearchCoursesComponent,
    CoursePreviewComponent,
    CourseDetailComponent,
    TaskDetailComponent,
    UserManagementComponent,
    AllSubmissionsComponent,
    CourseResultsComponent,
    TaskPreviewComponent,
    SubmissionFileComponent,
    SubmissionTextComponent,
    ResultsComponent,
    DropzoneComponent,
    MyCoursesComponent,
    ConferenceComponent,
    LoginComponent,
    TaskNewDialogComponent,
    CourseUpdateDialogComponent,
    AssignTicketDialogComponent,
    InvitetoConferenceDialogComponent,
    DropzoneComponent,
    MyCoursesComponent,
    ConferenceComponent,
    ParticipantsComponent,
    ConfigurationListComponent,
    MenuBarComponent,
    NewCheckerDialogComponent,
    ConfirmDialogComponent,
    InfoComponent,
    ReversePipe,
    TaskPointsDialogComponent,
    GoToComponent,
    GotoLinksDialogComponent,
    TaskPointsDialogComponent,
    EvaluationResultsComponent,
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
    MatSliderModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
  ],
  entryComponents: [DataprivacyDialogComponent, CreateGuestUserDialogComponent, ImpressumDialogComponent,
    InvitetoConferenceDialogComponent, AssignTicketDialogComponent],
  providers: [CookieService, httpInterceptorProviders],
  bootstrap: [AppComponent]
})
export class AppModule {
}

export function tokenGetter() {
  return localStorage.getItem('token');
}

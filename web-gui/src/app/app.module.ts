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


@Injectable()
export class ApiURIHttpInterceptor implements HttpInterceptor {
  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const clonedRequest: HttpRequest<any> = req.clone({
      url: (req.url.search('localhost') >= 0) ? req.url : 'https://localhost:8080' + req.url
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
    })
  ],
  entryComponents: [NewtaskDialogComponent, ExitCourseComponent, UpdateCourseDialogComponent, DataprivacyDialogComponent,
    ImpressumDialogComponent, DeleteCourseModalComponent],
  providers: [CookieService, MarkdownService, MarkedOptions],
  bootstrap: [AppComponent]
})
export class AppModule {
}

export function tokenGetter() {
  return localStorage.getItem('token');
}

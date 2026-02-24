import { CUSTOM_ELEMENTS_SCHEMA, Injectable, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { JwtModule } from "@auth0/angular-jwt";
import { I18NextModule } from "angular-i18next";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { AppComponent } from "./app.component";
import { AuthService } from "./service/auth.service";
import { MaterialComponentsModule } from "./modules/material-components/material-components.module";
import { SqlPlaygroundModule } from "./page-components/sql-playground/sql-playground.module";
import { ConfirmDialogComponent } from "./dialogs/confirm-dialog/confirm-dialog.component";
import { TextConfirmDialogComponent } from "./dialogs/text-confirm-dialog/text-confirm-dialog.component";
import { NewDbDialogComponent } from "./dialogs/new-db-dialog/new-db-dialog.component";
import { NewSqlTemplateComponent } from "./dialogs/new-sql-template/new-sql-template.component";
import { SharePlaygroundLinkDialogComponent } from "./dialogs/share-playground-link-dialog/share-playground-link-dialog.component";

@Injectable()
export class ApiURIHttpInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  public intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.authService.renewToken(event as HttpResponse<any>);
        }
      })
    );
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: ApiURIHttpInterceptor, multi: true },
];

@NgModule({
  declarations: [
    AppComponent,
    ConfirmDialogComponent,
    TextConfirmDialogComponent,
    NewDbDialogComponent,
    NewSqlTemplateComponent,
    SharePlaygroundLinkDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
      },
    }),
    I18NextModule,
    MaterialComponentsModule,
    SqlPlaygroundModule,
  ],
  providers: [httpInterceptorProviders],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}

export function tokenGetter() {
  return localStorage.getItem("token");
}

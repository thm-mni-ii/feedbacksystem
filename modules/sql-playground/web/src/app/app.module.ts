import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { I18NextModule } from 'angular-i18next';
import { JwtModule } from '@auth0/angular-jwt';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialComponentsModule } from './modules/material-components/material-components.module';
import { I18N_PROVIDERS } from './util/i18n';
import { SqlPlaygroundModule } from './features/sql-playground/sql-playground.module';

export function tokenGetter(): string | null {
  return localStorage.getItem('token');
}

@NgModule({ declarations: [AppComponent],
    bootstrap: [AppComponent], imports: [BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        MaterialComponentsModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        I18NextModule.forRoot(),
        JwtModule.forRoot({ config: { tokenGetter } }),
        SqlPlaygroundModule], providers: [...I18N_PROVIDERS, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule {}

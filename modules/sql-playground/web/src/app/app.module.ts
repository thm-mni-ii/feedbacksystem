import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { I18NextModule } from 'angular-i18next';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SqlPlaygroundPageComponent } from './sql-playground-page/sql-playground-page.component';
import { MaterialComponentsModule } from './modules/material-components/material-components.module';
import { I18N_PROVIDERS } from './util/i18n';

@NgModule({
  declarations: [AppComponent, SqlPlaygroundPageComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    MaterialComponentsModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    I18NextModule.forRoot(),
  ],
  providers: [...I18N_PROVIDERS],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '@environments/environment';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EntityDataModule } from '@ngrx/data';
import { EffectsModule } from '@ngrx/effects';
import { MomentModule } from 'ngx-moment';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { CoreModule } from './@core/core.module';
import { PagesModule } from '@app/@pages/pages.module';
import { AppComponent } from './app.component';
import { entityConfig } from './entity-metadata';
import { AppRoutingModule } from './app-routing.module';
import { XSRF_HEADER_NAME } from '@app/@core/interceptors/xsrf.interceptor';
import { AUTH_TOKEN_STORAGE, AUTH_TOKEN_STORAGE_KEY } from '@app/@core/services/auth/auth.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    MomentModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    StoreModule.forRoot({}, {}),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
    EffectsModule.forRoot([]),
    StoreRouterConnectingModule.forRoot(),
    EntityDataModule.forRoot(entityConfig),
    NgbModule,
    CoreModule,
    PagesModule,
    AppRoutingModule,
    HttpClientXsrfModule.withOptions({
      cookieName: environment.security.xsrf.cookie,
      headerName: environment.security.xsrf.header
    }),
  ],
  providers: [
    HttpClientModule,
    {
      provide: XSRF_HEADER_NAME,
      useValue: environment.security.xsrf.header
    },
    {
      provide: AUTH_TOKEN_STORAGE,
      useValue: sessionStorage
    },
    {
      provide: AUTH_TOKEN_STORAGE_KEY,
      useValue: 'auth-token'
    }
  ],
  bootstrap: [ AppComponent ],
})
export class AppModule {
}

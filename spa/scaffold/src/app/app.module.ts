import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MsalModule, MsalRedirectComponent, MsalGuard, MsalService, MSAL_INSTANCE, MSAL_GUARD_CONFIG, MSAL_INTERCEPTOR_CONFIG, MsalInterceptor } from '@azure/msal-angular';
import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { UserPageComponent } from './user/user-page.component';
import { MSALInstanceFactory, MSALGuardConfigFactory, MSALInterceptorConfigFactory } from './core/msal-config';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent, AuthComponent, UserPageComponent],
  imports: [BrowserModule, HttpClientModule, RouterModule, AppRoutingModule, MsalModule],
  providers: [
    { provide: MSAL_INSTANCE, useFactory: MSALInstanceFactory },
    { provide: MSAL_GUARD_CONFIG, useFactory: MSALGuardConfigFactory },
    { provide: MSAL_INTERCEPTOR_CONFIG, useFactory: MSALInterceptorConfigFactory },
    MsalService,
    MsalGuard,
    { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true }
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule {}

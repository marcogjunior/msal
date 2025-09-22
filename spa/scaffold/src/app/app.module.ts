import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalGuard,
  MsalInterceptor,
  MsalModule,
  MsalRedirectComponent,
  MsalService
} from '@azure/msal-angular';

import { IPublicClientApplication } from '@azure/msal-browser'; // <-- importa a interface
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import {
  MSALGuardConfigFactory,
  MSALInstanceFactory,
  MSALInterceptorConfigFactory
} from './core/msal-config';
import { UserPageComponent } from './user/user-page.component';

// >>> ADICIONE ESTA FUNÇÃO <<<
export function msalAppInitializer(instance: IPublicClientApplication) {
  // Angular espera uma função que retorne Promise<void>
  return () => instance.initialize();
}

@NgModule({
  declarations: [AppComponent, AuthComponent, UserPageComponent],
  imports: [BrowserModule, HttpClientModule, RouterModule, AppRoutingModule, MsalModule],
  providers: [
    { provide: MSAL_INSTANCE, useFactory: MSALInstanceFactory },

    // >>> ADICIONE ESTE PROVIDER <<<
    { provide: APP_INITIALIZER, useFactory: msalAppInitializer, deps: [MSAL_INSTANCE], multi: true },

    { provide: MSAL_GUARD_CONFIG, useFactory: MSALGuardConfigFactory },
    { provide: MSAL_INTERCEPTOR_CONFIG, useFactory: MSALInterceptorConfigFactory },
    MsalService,
    MsalGuard,
    { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true }
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule {}

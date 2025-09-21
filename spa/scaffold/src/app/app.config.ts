
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MsalInterceptor } from '@azure/msal-angular';
import { provideAuth } from './auth/auth.providers';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([MsalInterceptor])),
    provideAuth({
      tenantId: environment.tenantId,
      clientId: environment.clientId,
      redirectUri: environment.redirectUri,
      defaultScopes: [environment.api.scope],
      protectedResources: {
        [`${environment.api.baseUrl}/api`]: [environment.api.scope],
        [`${environment.api.baseUrl}/api/`]: [environment.api.scope],
      },
      loginType: 'redirect',
    }),
  ],
};


import { Provider, InjectionToken } from '@angular/core';
import {
  MsalService,
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalGuardConfiguration,
  MsalInterceptorConfiguration,
} from '@azure/msal-angular';
import { PublicClientApplication, InteractionType } from '@azure/msal-browser';

export interface AuthOptions {
  tenantId: string;
  clientId: string;
  redirectUri: string;
  defaultScopes: string[];
  protectedResources: Record<string, string[]>;
  loginType?: 'redirect' | 'popup';
}

export const AUTH_OPTIONS = new InjectionToken<AuthOptions>('AUTH_OPTIONS');

export function msalInstanceFactory(opts: AuthOptions) {
  return new PublicClientApplication({
    auth: {
      clientId: opts.clientId,
      authority: `https://login.microsoftonline.com/${opts.tenantId}`,
      redirectUri: opts.redirectUri,
    },
    cache: { cacheLocation: 'localStorage', storeAuthStateInCookie: false },
  });
}

export function guardConfigFactory(opts: AuthOptions): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: { scopes: opts.defaultScopes },
  };
}

export function interceptorConfigFactory(opts: AuthOptions): MsalInterceptorConfiguration {
  const map = new Map<string, string[]>();
  for (const [url, scopes] of Object.entries(opts.protectedResources)) {
    map.set(url, scopes);
  }
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: map,
  };
}

export function provideAuth(options: AuthOptions): Provider[] {
  return [
    { provide: AUTH_OPTIONS, useValue: options },
    { provide: MSAL_INSTANCE, useFactory: msalInstanceFactory, deps: [AUTH_OPTIONS] },
    { provide: MSAL_GUARD_CONFIG, useFactory: guardConfigFactory, deps: [AUTH_OPTIONS] },
    { provide: MSAL_INTERCEPTOR_CONFIG, useFactory: interceptorConfigFactory, deps: [AUTH_OPTIONS] },
    MsalService,
  ];
}

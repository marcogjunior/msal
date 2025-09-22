import { IPublicClientApplication, LogLevel, PublicClientApplication } from '@azure/msal-browser';
import { MsalGuardConfiguration, MsalInterceptorConfiguration, ProtectedResourceScopes } from '@azure/msal-angular';
import { environment } from '../../environments/environment';

const { clientId, tenantId, redirectUri, postLogoutRedirectUri } = environment.auth;

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      redirectUri,
      postLogoutRedirectUri
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false
    },
    system: {
      loggerOptions: {
        loggerCallback: (level, message) => {
          if (level === LogLevel.Error) console.error(message);
        },
        piiLoggingEnabled: false
      }
    }
  });
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: 'Redirect' as const,
    authRequest: {
      scopes: environment.graph.scopes
    }
  };
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string | ProtectedResourceScopes>>();
  protectedResourceMap.set(`${environment.graph.endpoint}/me`, environment.graph.scopes);
  return {
    interactionType: 'Redirect' as const,
    protectedResourceMap
  };
}

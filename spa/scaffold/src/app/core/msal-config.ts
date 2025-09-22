// +++ ADICIONE InteractionType aqui
import { MsalGuardConfiguration, MsalInterceptorConfiguration, ProtectedResourceScopes } from '@azure/msal-angular';
import { InteractionType, IPublicClientApplication, LogLevel, PublicClientApplication } from '@azure/msal-browser';
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
    cache: { cacheLocation: 'localStorage', storeAuthStateInCookie: false },
    system: { loggerOptions: { loggerCallback: (level, message) => { if (level === LogLevel.Error) console.error(message); }, piiLoggingEnabled: false } }
  });
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    // ❌ 'Redirect' as const  →  ✅ InteractionType.Redirect
    interactionType: InteractionType.Redirect,
    authRequest: { scopes: environment.graph.scopes }
  };
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string | ProtectedResourceScopes>>();
  protectedResourceMap.set(`${environment.graph.endpoint}/me`, environment.graph.scopes);

  return {
    // ❌ 'Redirect' as const  →  ✅ InteractionType.Redirect
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}


import { Injectable, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo, AuthenticationResult, SilentRequest, PopupRequest, RedirectRequest, InteractionRequiredAuthError } from '@azure/msal-browser';
import { AUTH_OPTIONS, AuthOptions } from './auth.providers';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private msal = inject(MsalService);
  private opts = inject(AUTH_OPTIONS);

  getActiveAccount(): AccountInfo | null {
    let account = this.msal.instance.getActiveAccount();
    if (!account) {
      const all = this.msal.instance.getAllAccounts();
      if (all.length > 0) {
        this.msal.instance.setActiveAccount(all[0]);
        account = all[0];
      }
    }
    return account;
  }

  isAuthenticated(): boolean { return !!this.getActiveAccount(); }
  getUserName(): string | null { return (this.getActiveAccount() as any)?.name ?? null; }

  async login(scopes: string[] = this.opts.defaultScopes): Promise<void> {
    if (this.opts.loginType === 'popup') {
      const req: PopupRequest = { scopes };
      const res = await this.msal.loginPopup(req);
      this.handleAuthResult(res);
    } else {
      const req: RedirectRequest = { scopes };
      await this.msal.loginRedirect(req);
    }
  }

  async logout(): Promise<void> { await this.msal.logoutRedirect({ postLogoutRedirectUri: this.opts.redirectUri }); }

  async getAccessToken(scopes: string[] = this.opts.defaultScopes): Promise<string> {
    const account = this.getActiveAccount(); if (!account) throw new Error('No active account');
    const silent: SilentRequest = { account, scopes };
    try {
      const result = await this.msal.acquireTokenSilent(silent);
      return result.accessToken;
    } catch (e: any) {
      if (e instanceof InteractionRequiredAuthError) { throw e; }
      throw e;
    }
  }

  async ensureAuthenticated(scopes: string[] = this.opts.defaultScopes): Promise<boolean> {
    try { await this.getAccessToken(scopes); return true; } catch { await this.login(scopes); return false; }
  }

  private handleAuthResult(result: AuthenticationResult) {
    if (result?.account) { this.msal.instance.setActiveAccount(result.account); }
  }

  hasAnyScopeOrRole(scopesOrRoles: string[]): boolean {
    const acc = this.getActiveAccount(); if (!acc) return false;
    const idc = acc.idTokenClaims as any;
    const roles: string[] = idc?.roles || [];
    const scp: string = idc?.scp || '';
    const scpList = scp.split(' ').filter(Boolean);
    return scopesOrRoles.some(s => roles.includes(s) || scpList.includes(s));
  }
}

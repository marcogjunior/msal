import { Component } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { RedirectRequest, PopupRequest } from '@azure/msal-browser';
import { Router } from '@angular/router';
import { environment } from '../../../src/environments/environment';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  loggedIn = false;
  userName: string | null = null;

  constructor(private msal: MsalService, private router: Router) {
    this.msal.instance.handleRedirectPromise().then(() => {
      this.updateState();
    });
  }

  private updateState() {
    const accounts = this.msal.instance.getAllAccounts();
    this.loggedIn = accounts.length > 0;
    this.userName = this.loggedIn ? (accounts[0].name ?? accounts[0].username) : null;
  }

  loginRedirect() {
    const req: RedirectRequest = { scopes: environment.graph.scopes };
    this.msal.loginRedirect(req);
  }

  loginPopup() {
    const req: PopupRequest = { scopes: environment.graph.scopes };
    this.msal.loginPopup(req).then(() => this.router.navigateByUrl('/me'));
  }

  logout() { this.msal.logoutRedirect(); }

  goToMe() { this.router.navigateByUrl('/me'); }
}

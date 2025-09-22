import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { PopupRequest, RedirectRequest } from '@azure/msal-browser';
import { environment } from '../../environments/environment';

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
    // Opcional: subscribe para “consumir” o Observable (não é obrigatório, pois fará redirect)
    this.msal.loginRedirect(req).subscribe();
  }

  loginPopup() {
    const req: PopupRequest = { scopes: environment.graph.scopes };
    // ❌ .then(...)  →  ✅ .subscribe(...)
    this.msal.loginPopup(req).subscribe({
      next: () => this.router.navigateByUrl('/me')
    });
  }

  logout() {
    this.msal.logoutRedirect().subscribe();
  }

  goToMe() { this.router.navigateByUrl('/me'); }
}

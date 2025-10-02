import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { from, Observable, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiBase = 'https://minimalamp-ep-erfhf2d8f4bjb2c9.z03.azurefd.net';
  private apiScopes = ['api://97569815-6fd5-4d2c-9857-c7dc2c239daf/access_as_user'];

  constructor(private http: HttpClient, private msal: MsalService) {}

  getProfile(): Observable<any> {
    // pega o token do MSAL
 let account = this.msal.instance.getActiveAccount();
    if (!account) {
      const all = this.msal.instance.getAllAccounts();
      if (all.length) {
        this.msal.instance.setActiveAccount(all[0]);
        account = all[0];
      }
    }
    if (!account) {
      return throwError(() => new Error('Nenhum usuário autenticado. Faça login primeiro.'));
    }

    return from(this.msal.acquireTokenSilent({ scopes: this.apiScopes, account })).pipe(
      switchMap(result => {
        const headers = { Authorization: `Bearer ${result.accessToken}` };
        return this.http.get(`${this.apiBase}/api/profile`, { headers });
      })
    );
  }
}

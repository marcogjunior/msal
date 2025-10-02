import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiBase = 'https://minimalamp-ep-erfhf2d8f4bjb2c9.z03.azurefd.net'; // seu AFD endpoint

  constructor(private http: HttpClient, private msal: MsalService) {}

  getProfile(): Observable<any> {
    // pega o token do MSAL
    const account = this.msal.instance.getActiveAccount();
    if (!account) {
      throw new Error('Nenhum usuário autenticado.');
    }

    return new Observable((observer) => {
  this.msal.acquireTokenSilent({
    scopes: ['api://97569815-6fd5-4d2c-9857-c7dc2c239daf/access_as_user'],
    account
  }).subscribe({
    next: (result) => {
      const headers = { Authorization: `Bearer ${result.accessToken}` };
      this.http.get(`${this.apiBase}/api/profile`, { headers })
        .subscribe({
          next: (resp) => observer.next(resp),
          error: (err) => observer.error(err),
          complete: () => observer.complete()
        });
    },
    error: (err) => observer.error(err)
  });
});
  }
}

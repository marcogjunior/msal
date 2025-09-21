
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <h2>Profile Seguro</h2>
    <button (click)="load()">Carregar</button>
    <pre>{{ data | json }}</pre>
  `,
})
export class ProfileComponent {
  data: any;
  constructor(private http: HttpClient) {}
  load() {
    this.http.get(`${environment.api.baseUrl}/api/profile`).subscribe(d => this.data = d);
  }
}

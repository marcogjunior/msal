
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthButtonComponent } from './auth/auth-button.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, AuthButtonComponent],
  template: `
    <h1>MinimalAmp</h1>
    <app-auth-button />
    <p><a routerLink="/profile">Ir para Profile (protegido)</a></p>
  `,
})
export class HomeComponent {}


import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthFacade } from './auth.facade';

@Component({
  selector: 'app-auth-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button *ngIf="!isAuth()" (click)="login()">Login</button>
    <div *ngIf="isAuth()" class="flex items-center gap-2">
      <span>Olá, {{ name() || 'usuário' }}</span>
      <button (click)="logout()">Sair</button>
    </div>
  `,
})
export class AuthButtonComponent {
  private auth = inject(AuthFacade);
  name = signal<string | null>(null);

  constructor() { effect(() => this.name.set(this.auth.getUserName())); }
  isAuth() { return this.auth.isAuthenticated(); }
  login() { return this.auth.login(); }
  logout() { return this.auth.logout(); }
}

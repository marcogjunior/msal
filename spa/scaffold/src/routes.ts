import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { AuthComponent } from './app/auth/auth.component';
import { UserPageComponent } from './app/user/user-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'me', component: UserPageComponent, canActivate: [MsalGuard] },
  { path: '**', redirectTo: 'auth' }
];

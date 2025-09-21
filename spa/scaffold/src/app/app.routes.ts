
import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { ProfileComponent } from './profile.component';
import { ScopesGuard } from './auth/scopes.guard';
import { environment } from '../environments/environment';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [ScopesGuard], data: { scopes: [environment.api.scope] } },
  { path: '**', redirectTo: '' },
];

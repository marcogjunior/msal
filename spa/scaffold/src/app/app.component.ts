import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <h2>Angular MSAL + Entra ID + Graph</h2>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {}

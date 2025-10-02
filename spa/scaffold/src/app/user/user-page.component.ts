import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/api-service';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html'
})
export class UserPageComponent implements OnInit {
  profile: any = null;
  loading = true;
  error: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getProfile().subscribe({
      next: (data) => { this.profile = data; this.loading = false; },
      error: (err) => { this.error = (err?.message || 'Erro ao obter /api/profile'); this.loading = false; }
    });
  }
}

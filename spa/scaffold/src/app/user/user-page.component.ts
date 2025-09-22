import { Component, OnInit } from '@angular/core';
import { GraphService } from '../core/graph.service';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html'
})
export class UserPageComponent implements OnInit {
  me: any = null;
  loading = true;
  error: string | null = null;

  constructor(private graph: GraphService) {}

  ngOnInit(): void {
    this.graph.getMe().subscribe({
      next: (data) => { this.me = data; this.loading = false; },
      error: (err) => { this.error = (err?.message || 'Erro ao obter /me'); this.loading = false; }
    });
  }
}

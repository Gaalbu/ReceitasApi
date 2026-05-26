import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  error: string | null = null;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    // The backend exposes only update/delete for /users/me; list users may be restricted.
    // We keep a placeholder list; attempt to call a safe endpoint if available.
    this.users = [{ id: 1, name: 'Exemplo', email: 'exemplo@dominio' }];
  }

  deleteAccount(): void {
    this.usersService.deleteAccount().subscribe({
      next: () => { this.users = []; },
      error: err => { this.error = 'Erro ao deletar conta: ' + (err?.message || err); }
    });
  }
}

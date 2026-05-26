import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  error: string | null = null;

  // create / edit form
  formName = '';
  formEmail = '';
  editingId: number | null = null;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    // The backend exposes only update/delete for /users/me; list users may be restricted.
    // We keep a placeholder list; attempt to call a safe endpoint if available.
    this.usersService.listUsers().subscribe(u => { this.users = u.length ? u : [{ id: 1, name: 'Exemplo', email: 'exemplo@dominio' }]; });
  }

  deleteAccount(): void {
    this.usersService.deleteAccount().subscribe({
      next: () => { this.users = []; },
      error: err => { this.error = 'Erro ao deletar conta: ' + (err?.message || err); }
    });
  }

  create(): void {
    if (!this.formName || !this.formEmail) { this.error = 'Preencha nome e email'; return; }
    const payload = { name: this.formName, email: this.formEmail };
    this.usersService.createUser(payload).subscribe({ next: u => { this.users.push(u); this.formName=''; this.formEmail=''; }, error: () => this.error = 'Falha ao criar usuário' });
  }

  edit(user: any): void { this.editingId = user.id; this.formName = user.name; this.formEmail = user.email; }

  saveEdit(): void {
    if (!this.editingId) return;
    const payload = { id: this.editingId, name: this.formName, email: this.formEmail };
    this.usersService.updateProfile(payload).subscribe({ next: updated => {
      const idx = this.users.findIndex(u => u.id === this.editingId);
      if (idx >= 0) this.users[idx] = { ...this.users[idx], ...updated };
      this.editingId = null; this.formName=''; this.formEmail='';
    }, error: () => this.error = 'Falha ao salvar edição' });
  }

  cancelEdit(): void { this.editingId = null; this.formName=''; this.formEmail=''; }
}

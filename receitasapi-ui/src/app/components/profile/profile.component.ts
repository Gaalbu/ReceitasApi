import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  imports: [CommonModule, ReactiveFormsModule]
})
export class ProfileComponent {
  message = '';
  loading = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: [''],
      email: ['', [Validators.email]],
      password: ['']
    });
  }

  save() {
    const payload = this.cleanPayload();

    if (!payload.username && !payload.email && !payload.password) {
      this.message = 'Preencha ao menos um campo para atualizar.';
      return;
    }

    this.loading = true;
    this.message = '';

    this.auth.updateProfile(payload).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Perfil atualizado com sucesso!';
      },
      error: () => {
        this.loading = false;
        this.message = 'Erro ao atualizar o perfil.';
      }
    });
  }

  removeAccount() {
    const confirmed = typeof window === 'undefined' ? true : window.confirm('Tem certeza que deseja excluir sua conta?');
    if (!confirmed) {
      return;
    }

    this.loading = true;
    this.message = '';

    this.auth.deleteAccount().subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Conta excluída com sucesso.';
        this.router.navigate(['/register']);
      },
      error: () => {
        this.loading = false;
        this.message = 'Erro ao excluir a conta.';
      }
    });
  }

  private cleanPayload(): { username?: string; email?: string; password?: string } {
    const username = this.trimValue(this.form.value.username);
    const email = this.trimValue(this.form.value.email);
    const password = this.trimValue(this.form.value.password);

    return {
      ...(username ? { username } : {}),
      ...(email ? { email } : {}),
      ...(password ? { password } : {})
    };
  }

  private trimValue(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }
}
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  standalone: true
})
export class RegisterComponent {
  form!: FormGroup;
  error = '';
  private _loading = false;

  get loading() {
    return this._loading;
  }

  set loading(value: boolean) {
    this._loading = value;
    if (this.form) {
      if (value) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    }
  }

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit() {
    if (this.form.invalid) return;
    
    this.loading = true;
    this.error = '';
    
    this.auth.register(this.form.value).subscribe({
      next: () => {
        console.log('✓ Cadastro bem-sucedido');
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        console.error('✗ Erro ao registrar:', err);
        
        let errorMsg = 'Erro ao registrar';
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.error?.error) {
          errorMsg = err.error.error;
        } else if (err?.message) {
          errorMsg = err.message;
        } else if (err?.statusText) {
          errorMsg = `${err.status}: ${err.statusText}`;
        }
        
        this.error = errorMsg;
      }
    });
  }
}

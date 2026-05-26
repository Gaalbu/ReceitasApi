import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  standalone: true
})
export class LoginComponent {
  form!: FormGroup;
  error = '';
  returnUrl = '/';
  loading = false;

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  submit() {
    if (this.form.invalid) return;
    
    this.loading = true;
    this.error = '';
    
    this.auth.login(this.form.value).subscribe({
      next: (res) => {
        console.log('✓ Login bem-sucedido:', res);
        this.loading = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.loading = false;
        console.error('✗ Erro ao fazer login:', err);
        
        // Tenta extrair a mensagem de erro
        let errorMsg = 'Erro ao logar';
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

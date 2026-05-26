import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: any;
  let router: any;

  beforeEach(async () => {
    const authServiceMock = {
      register: () => of({})
    };
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the register component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty fields', () => {
    expect(component.form.get('username')?.value).toBe('');
    expect(component.form.get('email')?.value).toBe('');
    expect(component.form.get('password')?.value).toBe('');
  });

  it('should have invalid form when fields are empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should have valid form when all fields are filled correctly', () => {
    component.form.get('username')?.setValue('testuser');
    component.form.get('email')?.setValue('test@example.com');
    component.form.get('password')?.setValue('password123');
    expect(component.form.valid).toBe(true);
  });

  it('should require username field', () => {
    const usernameControl = component.form.get('username');
    usernameControl?.setValue('');
    usernameControl?.markAsTouched();
    expect(usernameControl?.hasError('required')).toBe(true);
  });

  it('should require email field', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('');
    emailControl?.markAsTouched();
    expect(emailControl?.hasError('required')).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);
  });

  it('should accept valid email', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should require password minimum length of 6 characters', () => {
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('short');
    expect(passwordControl?.hasError('minlength')).toBe(true);
  });

  it('should accept password with 6 or more characters', () => {
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('password123');
    expect(passwordControl?.hasError('minlength')).toBe(false);
  });

  it('should render username input field', () => {
    const input = fixture.nativeElement.querySelector('input[formControlName="username"]');
    expect(input).toBeTruthy();
    expect(input.placeholder).toBe('Escolha um usuário');
  });

  it('should render email input field', () => {
    const input = fixture.nativeElement.querySelector('input[formControlName="email"]');
    expect(input).toBeTruthy();
    expect(input.type).toBe('email');
  });

  it('should render password input field', () => {
    const input = fixture.nativeElement.querySelector('input[formControlName="password"]');
    expect(input).toBeTruthy();
    expect(input.type).toBe('password');
  });

  it('should render submit button', () => {
    component.loading = false;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button).toBeTruthy();
  });

  it('should render error alert when error exists', () => {
    const freshFixture = TestBed.createComponent(RegisterComponent);
    const freshComp = freshFixture.componentInstance;
    freshComp.error = 'Test error';
    freshFixture.detectChanges();
    const alert = freshFixture.nativeElement.querySelector('.alert-danger');
    expect(alert).toBeTruthy();
  });

  it('should not render error alert when no error', () => {
    component.error = '';
    fixture.detectChanges();
    const alert = fixture.nativeElement.querySelector('.alert-danger');
    expect(alert).toBeFalsy();
  });

  it('should disable inputs while loading', () => {
    const freshFixture = TestBed.createComponent(RegisterComponent);
    const freshComp = freshFixture.componentInstance;
    freshComp.loading = true;
    freshFixture.detectChanges();
    const usernameControl = freshComp.form.get('username');
    expect(usernameControl?.disabled).toBe(true);
  });
});

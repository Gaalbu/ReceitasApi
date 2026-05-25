import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: any;
  let router: any;

  beforeEach(async () => {
    const authServiceMock = {
      login: () => of({ token: 'jwt-token' })
    };
    const routerMock = {
      navigateByUrl: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParams: {} }
          }
        }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty username and password', () => {
    expect(component.form.get('username')?.value).toBe('');
    expect(component.form.get('password')?.value).toBe('');
  });

  it('should have invalid form when fields are empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should have valid form when both fields are filled', () => {
    component.form.get('username')?.setValue('testuser');
    component.form.get('password')?.setValue('password123');
    expect(component.form.valid).toBe(true);
  });

  it('should require username field', () => {
    const usernameControl = component.form.get('username');
    usernameControl?.setValue('');
    usernameControl?.markAsTouched();
    expect(usernameControl?.hasError('required')).toBe(true);
  });

  it('should render username input field', () => {
    const input = fixture.nativeElement.querySelector('input[formControlName="username"]');
    expect(input).toBeTruthy();
    expect(input.placeholder).toBe('Digite seu usuário');
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
    component.error = 'Test error';
    fixture.detectChanges();
    const alert = fixture.nativeElement.querySelector('.alert-danger');
    expect(alert).toBeTruthy();
  });

  it('should not render error alert when no error', () => {
    component.error = '';
    fixture.detectChanges();
    const alert = fixture.nativeElement.querySelector('.alert-danger');
    expect(alert).toBeFalsy();
  });

  it('should disable form when invalid', () => {
    component.form.get('username')?.setValue('');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
  });

  it('should not submit if form is invalid', () => {
    component.form.get('username')?.setValue('');
    component.form.get('password')?.setValue('');

    component.submit();

    expect(component.error).toBe('');
  });

  it('should set returnUrl from route params', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: { login: () => of({}) } },
        { provide: Router, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParams: { returnUrl: '/meal-plan' } }
          }
        }
      ]
    });

    const newComponent = TestBed.createComponent(LoginComponent).componentInstance;
    expect(newComponent.returnUrl).toBe('/meal-plan');
  });
});

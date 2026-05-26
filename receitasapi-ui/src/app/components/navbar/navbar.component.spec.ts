import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../services/auth.service';
import { vi } from 'vitest';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authService: any;
  let router: any;

  beforeEach(async () => {
    const authServiceMock = {
      logout: () => {},
      isLoggedIn: () => true,
      isAuthenticated$: of(true)
    };
    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  it('should create the navbar component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with navbar closed', () => {
    expect(component.navbarOpen).toBe(false);
  });

  it('should initialize with dropdown closed', () => {
    expect(component.dropdownOpen).toBe(false);
  });

  it('should set isLoggedIn based on auth service', () => {
    authService.isLoggedIn = () => true;
    component.ngOnInit();
    expect(component.isLoggedIn).toBe(true);
  });

  it('should toggle navbar state', () => {
    expect(component.navbarOpen).toBe(false);
    component.toggleNavbar();
    expect(component.navbarOpen).toBe(true);
    component.toggleNavbar();
    expect(component.navbarOpen).toBe(false);
  });

  it('should close navbar', () => {
    component.navbarOpen = true;
    component.closeNavbar();
    expect(component.navbarOpen).toBe(false);
  });

  it('should toggle dropdown state', () => {
    expect(component.dropdownOpen).toBe(false);
    component.toggleDropdown();
    expect(component.dropdownOpen).toBe(true);
    component.toggleDropdown();
    expect(component.dropdownOpen).toBe(false);
  });

  it('should close dropdown', () => {
    component.dropdownOpen = true;
    component.closeDropdown();
    expect(component.dropdownOpen).toBe(false);
  });

  it('should logout and navigate to login', () => {
    component.isLoggedIn = true;
    component.navbarOpen = true;
    component.logout();
    
    expect(component.isLoggedIn).toBe(false);
    expect(component.navbarOpen).toBe(false);
  });

  it('should render navbar brand', () => {
    fixture.detectChanges();
    const brand = fixture.nativeElement.querySelector('.navbar-brand');
    expect(brand).toBeTruthy();
    expect(brand.textContent).toContain('ReceitasApi');
  });

  it('should render hamburger menu button', () => {
    fixture.detectChanges();
    const toggleButton = fixture.nativeElement.querySelector('.navbar-toggler');
    expect(toggleButton).toBeTruthy();
  });

  it('should show logged-in menu when isLoggedIn is true', () => {
    authService.isLoggedIn = () => true;
    component.ngOnInit();
    fixture.detectChanges();
    
    const buscarReceitasLink = fixture.nativeElement.querySelector('a[routerLink="/"]');
    expect(buscarReceitasLink).toBeTruthy();
  });

  it('should show login link when not logged in', () => {
    authService.isLoggedIn = () => false;
    authService.isAuthenticated$ = of(false);
    component.ngOnInit();
    fixture.detectChanges();
    
    const loginLink = fixture.nativeElement.querySelector('a[routerLink="/login"]');
    expect(loginLink).toBeTruthy();
  });

  it('should apply show class to navbar when navbarOpen is true', () => {
    component.navbarOpen = true;
    fixture.detectChanges();
    
    const navbarCollapse = fixture.nativeElement.querySelector('.navbar-collapse');
    expect(navbarCollapse.classList.contains('show')).toBe(true);
  });

  it('should apply show class to dropdown menu when dropdownOpen is true', () => {
    authService.isLoggedIn = () => true;
    component.ngOnInit();
    component.dropdownOpen = true;
    fixture.detectChanges();
    
    const dropdownMenu = fixture.nativeElement.querySelector('.dropdown-menu');
    expect(dropdownMenu.classList.contains('show')).toBe(true);
  });
});

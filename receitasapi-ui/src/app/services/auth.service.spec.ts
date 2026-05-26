import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should register using /api/auth/register', () => {
    const payload = { username: 'tester', email: 'tester@example.com', password: '123456' };

    service.register(payload).subscribe();

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ ok: true });
  });

  it('should store token on successful login', () => {
    const payload = { username: 'tester', password: '123456' };

    service.login(payload).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'jwt-token' });

    expect(localStorage.getItem('token')).toBe('jwt-token');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should not store token when login response has no token', () => {
    const payload = { username: 'tester', password: '123456' };

    service.login(payload).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ ok: true });

    expect(localStorage.getItem('token')).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should read token from storage and react to missing storage', () => {
    localStorage.setItem('token', 'jwt-token');
    expect(service.getToken()).toBe('jwt-token');
    expect(service.isLoggedIn()).toBe(true);

    const storageCheckSpy = vi.spyOn(service as any, 'isLocalStorageAvailable').mockReturnValue(false);

    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);

    service.logout();
    expect(storageCheckSpy).toHaveBeenCalled();
  });

  it('should initialize authenticated state when token exists', () => {
    localStorage.setItem('token', 'jwt-token');

    // Since AuthService is a singleton, we need to reset TestBed to get a fresh instance
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    const freshService = TestBed.inject(AuthService);

    let current = false;
    freshService.isAuthenticated$.subscribe((value) => {
      current = value;
    });

    expect(current).toBe(true);
  });

  it('should clear token on logout', () => {
    localStorage.setItem('token', 'jwt-token');

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });
});

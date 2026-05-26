import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceMock: { isLoggedIn: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = {
      isLoggedIn: vi.fn()
    };

    routerMock = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should allow access when user is logged in', () => {
    authServiceMock.isLoggedIn.mockReturnValue(true);

    const result = guard.canActivate({} as any, { url: '/meal-plans' } as RouterStateSnapshot);

    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not logged in', () => {
    authServiceMock.isLoggedIn.mockReturnValue(false);

    const result = guard.canActivate({} as any, { url: '/meal-plans' } as RouterStateSnapshot);

    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/meal-plans' } });
  });
});

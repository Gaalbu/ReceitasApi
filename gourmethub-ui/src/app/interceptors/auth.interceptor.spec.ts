import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: { getToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = {
      getToken: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header when token exists', () => {
    authServiceMock.getToken.mockReturnValue('header.payload.signature');

    http.get('/api/recipes/search?name=chicken').subscribe();

    const req = httpMock.expectOne('/api/recipes/search?name=chicken');
    expect(req.request.headers.get('Authorization')).toBe('Bearer header.payload.signature');
    req.flush({});
  });

  it('should not add Authorization header when token is missing', () => {
    authServiceMock.getToken.mockReturnValue(null);

    http.get('/api/recipes/search?name=chicken').subscribe();

    const req = httpMock.expectOne('/api/recipes/search?name=chicken');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});

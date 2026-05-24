import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = '/api';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Ajusta base para desenvolvimento local com SSR (porta 4000)
    try {
      if (typeof window !== 'undefined' && window.location && window.location.port === '4000') {
        this.base = 'http://localhost:8080';
      }
    } catch {
      // ignore when running on server-side during SSR
    }
    // Inicializa apenas se localStorage estiver disponível
    if (this.isLocalStorageAvailable()) {
      this.isAuthenticatedSubject.next(this.hasToken());
    }
  }

  private isLocalStorageAvailable(): boolean {
    try {
      return typeof localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  register(payload: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.base}/auth/register`, payload);
  }

  login(payload: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.base}/auth/login`, payload).pipe(
      tap((res: any) => {
        if (res && res.token && this.isLocalStorageAvailable()) {
          localStorage.setItem('token', res.token);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  getToken(): string | null {
    if (!this.isLocalStorageAvailable()) {
      return null;
    }
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    if (!this.isLocalStorageAvailable()) {
      return false;
    }
    return this.hasToken();
  }

  private hasToken(): boolean {
    if (!this.isLocalStorageAvailable()) {
      return false;
    }
    return !!localStorage.getItem('token');
  }

  logout() {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem('token');
    }
    this.isAuthenticatedSubject.next(false);
  }
}

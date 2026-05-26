import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { resolveApiBase } from './api-base';
import { LocalStoreService } from './local-store.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient, private local: LocalStoreService) {}

  private endpoint(path: string): string {
    return `${resolveApiBase()}${path}`;
  }

  updateProfile(payload: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(this.endpoint('/users/me'), payload, { headers }).pipe(
      catchError(() => {
        // fallback: update local copy if present
        const local = this.local.get<any[]>('users') || [];
        const idx = local.findIndex(u => u.id === payload.id);
        if (idx >= 0) { local[idx] = { ...local[idx], ...payload }; this.local.set('users', local); }
        return of(payload);
      })
    );
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(this.endpoint('/users/me')).pipe(
      catchError(() => {
        // remove local demo account
        const local = this.local.get<any[]>('users') || [];
        // assume current user is first one in local for demo
        local.shift();
        this.local.set('users', local);
        return of(void 0);
      })
    );
  }

  // Demo helpers: list/create users stored locally when backend lacks endpoints
  listUsers(): Observable<any[]> {
    const data = this.local.get<any[]>('users') || [];
    return of(data);
  }

  createUser(payload: any): Observable<any> {
    const localArr = this.local.get<any[]>('users') || [];
    const entry = { ...payload, id: this.local.generateId() };
    localArr.push(entry);
    this.local.set('users', localArr);
    return of(entry);
  }
}

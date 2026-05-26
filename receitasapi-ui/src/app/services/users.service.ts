import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { resolveApiBase } from './api-base';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient) {}

  private endpoint(path: string): string {
    return `${resolveApiBase()}${path}`;
  }

  updateProfile(payload: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(this.endpoint('/users/me'), payload, { headers });
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(this.endpoint('/users/me'));
  }
}

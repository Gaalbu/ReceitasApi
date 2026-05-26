import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { resolveApiBase } from './api-base';
import { LocalStoreService } from './local-store.service';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  constructor(private http: HttpClient, private local: LocalStoreService) {}

  private endpoint(path: string): string {
    return `${resolveApiBase()}${path}`;
  }

  listMyFavorites(): Observable<any[]> {
    return this.http.get<any[]>(this.endpoint('/favorites/me')).pipe(
      catchError(() => {
        const local = this.local.get<any[]>('favorites') || [];
        return of(local);
      })
    );
  }

  addFavorite(payload: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.endpoint('/favorites'), payload, { headers }).pipe(
      catchError(() => {
        const local = this.local.get<any[]>('favorites') || [];
        const entry = { ...payload, id: this.local.generateId() };
        local.push(entry);
        this.local.set('favorites', local);
        return of(entry);
      })
    );
  }

  deleteFavorite(id: number) {
    return this.http.delete(this.endpoint(`/favorites/${id}`)).pipe(
      catchError(() => {
        const local = this.local.get<any[]>('favorites') || [];
        const filtered = local.filter(f => f.id !== id);
        this.local.set('favorites', filtered);
        return of(null);
      })
    );
  }
}

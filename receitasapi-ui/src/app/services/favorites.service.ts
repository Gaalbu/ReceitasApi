import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { resolveApiBase } from './api-base';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  constructor(private http: HttpClient) {}

  private endpoint(path: string): string {
    return `${resolveApiBase()}${path}`;
  }

  listMyFavorites(): Observable<any[]> {
    return this.http.get<any[]>(this.endpoint('/favorites/me'));
  }

  addFavorite(payload: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.endpoint('/favorites'), payload, { headers });
  }

  deleteFavorite(id: number) {
    return this.http.delete(this.endpoint(`/favorites/${id}`));
  }
}

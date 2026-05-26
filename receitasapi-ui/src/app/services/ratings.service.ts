import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { resolveApiBase } from './api-base';
import { LocalStoreService } from './local-store.service';

@Injectable({ providedIn: 'root' })
export class RatingsService {
  constructor(private http: HttpClient, private local: LocalStoreService) {}

  private endpoint(path: string): string {
    return `${resolveApiBase()}${path}`;
  }

  myRatings(): Observable<any[]> {
    return this.http.get<any[]>(this.endpoint('/recipes/ratings/me')).pipe(
      catchError(() => {
        const local = this.local.get<any[]>('ratings') || [];
        return of(local);
      })
    );
  }

  addRating(recipeId: number, payload: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.endpoint(`/recipes/${recipeId}/ratings`), payload, { headers }).pipe(
      catchError(() => {
        const local = this.local.get<any[]>('ratings') || [];
        const entry = { ...payload, id: this.local.generateId(), recipeId };
        local.push(entry);
        this.local.set('ratings', local);
        return of(entry);
      })
    );
  }
}

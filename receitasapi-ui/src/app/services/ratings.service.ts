import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { resolveApiBase } from './api-base';

@Injectable({ providedIn: 'root' })
export class RatingsService {
  constructor(private http: HttpClient) {}

  private endpoint(path: string): string {
    return `${resolveApiBase()}${path}`;
  }

  myRatings(): Observable<any[]> {
    return this.http.get<any[]>(this.endpoint('/recipes/ratings/me'));
  }

  addRating(recipeId: number, payload: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.endpoint(`/recipes/${recipeId}/ratings`), payload, { headers });
  }
}

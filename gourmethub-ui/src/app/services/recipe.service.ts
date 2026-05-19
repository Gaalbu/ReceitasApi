import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private base = '/api';
  constructor(private http: HttpClient) {}

  searchExternal(name: string): Observable<any> {
    return this.http.get(`${this.base}/recipes/search?name=${encodeURIComponent(name)}`);
  }

  createMyRecipe(payload: any) {
    return this.http.post(`${this.base}/recipes`, payload);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { resolveApiBase } from './api-base';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  constructor(private http: HttpClient) {}

  private endpoint(path: string): string {
    return `${resolveApiBase()}${path}`;
  }

  searchExternal(name: string): Observable<any> {
    return this.http.get(this.endpoint(`/recipes/search?name=${encodeURIComponent(name)}`));
  }

  createMyRecipe(payload: any) {
    return this.http.post(this.endpoint('/recipes'), payload);
  }
}

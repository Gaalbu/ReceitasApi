import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { resolveApiBase } from './api-base';
import { HttpHeaders } from '@angular/common/http';

export type RecipePayload = {
  name: string;
  description: string;
  instructions: string;
  prep_time?: number;
};

export type FavoritePayload = {
  external_recipe_id: string;
  recipe_name: string;
  image_url?: string;
};

@Injectable({ providedIn: 'root' })
export class RecipeService {
  constructor(private http: HttpClient) {}

  private endpoint(path: string): string {
    return `${resolveApiBase()}${path}`;
  }

  searchExternal(name: string): Observable<any> {
    return this.http.get(this.endpoint(`/recipes/search?name=${encodeURIComponent(name)}`));
  }

  getMyRecipes(): Observable<any[]> {
    return this.http.get<any[]>(this.endpoint('/recipes/me'));
  }

  getMyFavorites(): Observable<any[]> {
    return this.http.get<any[]>(this.endpoint('/favorites/me'));
  }

  createMyRecipe(payload: RecipePayload) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.endpoint('/recipes'), payload, { headers });
  }

  updateMyRecipe(recipeId: number, payload: RecipePayload) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(this.endpoint(`/recipes/${recipeId}`), payload, { headers });
  }

  deleteMyRecipe(recipeId: number) {
    return this.http.delete<void>(this.endpoint(`/recipes/${recipeId}`));
  }

  addFavorite(payload: FavoritePayload) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.endpoint('/favorites'), payload, { headers });
  }

  deleteFavorite(favoriteId: number) {
    return this.http.delete<void>(this.endpoint(`/favorites/${favoriteId}`));
  }
}

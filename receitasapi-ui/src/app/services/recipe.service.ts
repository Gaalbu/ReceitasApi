import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { resolveApiBase } from './api-base';
import { HttpHeaders } from '@angular/common/http';

export interface RecipeOption {
  id: number;
  label: string;
  source: 'mine' | 'api';
}

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
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.endpoint('/recipes'), payload, { headers });
  }

  listMyRecipes(): Observable<any[]> {
    return this.http.get<any[]>(this.endpoint('/recipes/me'));
  }

  listMyRecipeOptions(): Observable<RecipeOption[]> {
    return this.listMyRecipes().pipe(
      map((recipes) => recipes
        .map((recipe) => this.normalizeRecipeOption(recipe, 'mine'))
        .filter((recipe): recipe is RecipeOption => recipe !== null))
    );
  }

  searchRecipeOptions(term: string): Observable<RecipeOption[]> {
    const query = term.trim();

    if (!query) {
      return this.listMyRecipeOptions();
    }

    return forkJoin({
      mine: this.listMyRecipes(),
      api: this.searchExternal(query)
    }).pipe(
      map(({ mine, api }) => {
        const apiRecipes = Array.isArray(api) ? api : api?.meals || api?.recipes || [];
        return this.mergeRecipeOptions(
          mine.map((recipe) => this.normalizeRecipeOption(recipe, 'mine')),
          apiRecipes.map((recipe: any) => this.normalizeRecipeOption(recipe, 'api'))
        );
      })
    );
  }

  getRecipeOptions(term = ''): Observable<RecipeOption[]> {
    return this.searchRecipeOptions(term);
  }

  getMyRecipe(recipeId: number): Observable<any> {
    return this.http.get<any>(this.endpoint(`/recipes/${recipeId}`));
  }

  updateMyRecipe(recipeId: number, payload: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<any>(this.endpoint(`/recipes/${recipeId}`), payload, { headers });
  }

  deleteMyRecipe(recipeId: number): Observable<void> {
    return this.http.delete<void>(this.endpoint(`/recipes/${recipeId}`));
  }

  private normalizeRecipeOption(recipe: any, source: RecipeOption['source']): RecipeOption | null {
    const id = Number(recipe?.id ?? recipe?.idMeal ?? recipe?.external_api_id);
    if (Number.isNaN(id) || id <= 0) {
      return null;
    }

    const label = recipe?.name
      || recipe?.title
      || recipe?.strMeal
      || recipe?.recipeTitle
      || recipe?.description
      || `Receita #${id}`;

    return { id, label, source };
  }

  private mergeRecipeOptions(...groups: Array<Array<RecipeOption | null>>): RecipeOption[] {
    const unique = new Map<number, RecipeOption>();

    for (const group of groups) {
      for (const option of group) {
        if (option) {
          unique.set(option.id, option);
        }
      }
    }

    return Array.from(unique.values()).sort((left, right) => left.label.localeCompare(right.label));
  }
}

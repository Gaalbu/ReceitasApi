import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FavoritesService } from '../../services/favorites.service';
import { RecipeOption, RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './favorites.component.html'
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];
  error: string | null = null;
  newRecipeTitle = '';
  newRecipeId: number | null = null;
  showCreate = false;
  editing: any = null;
  recipeSearch = '';
  availableRecipes: RecipeOption[] = [];
  loadingRecipes = false;

  constructor(private favoritesService: FavoritesService, private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.loadFavorites();
    this.loadRecipeOptions();
  }

  loadFavorites(): void {
    this.favoritesService.listMyFavorites().subscribe({
      next: data => this.favorites = data || [],
      error: err => this.error = 'Não foi possível carregar favoritos'
    });
  }

  loadRecipeOptions(term = ''): void {
    this.loadingRecipes = true;
    const preservedSelection = this.preservedSelectedRecipe();
    this.recipeService.getRecipeOptions(term).subscribe({
      next: (options) => {
        this.availableRecipes = this.mergeSelectedRecipe(options || [], preservedSelection);
        this.syncSelectedRecipe();
        this.loadingRecipes = false;
      },
      error: () => {
        this.error = 'Não foi possível carregar receitas válidas.';
        this.loadingRecipes = false;
      }
    });
  }

  searchRecipes(): void {
    this.loadRecipeOptions(this.recipeSearch);
  }

  syncSelectedRecipe(): void {
    const selected = this.availableRecipes.find((recipe) => recipe.id === this.newRecipeId);
    if (selected) {
      this.newRecipeTitle = selected.label;
    }
  }

  private preservedSelectedRecipe(): RecipeOption | null {
    if (this.newRecipeId === null) {
      return null;
    }

    return this.availableRecipes.find((recipe) => recipe.id === this.newRecipeId) || {
      id: this.newRecipeId,
      label: this.newRecipeTitle || `Receita #${this.newRecipeId}`,
      source: 'mine'
    };
  }

  private mergeSelectedRecipe(options: RecipeOption[], preservedSelection: RecipeOption | null): RecipeOption[] {
    if (!preservedSelection) {
      return options;
    }

    return options.some((option) => option.id === preservedSelection.id)
      ? options
      : [preservedSelection, ...options];
  }

  remove(id: number): void {
    this.favoritesService.deleteFavorite(id).subscribe({
      next: () => this.loadFavorites(),
      error: () => this.error = 'Falha ao remover favorito'
    });
  }

  create(): void {
    const selected = this.availableRecipes.find((recipe) => recipe.id === this.newRecipeId);
    if (!selected) {
      this.error = 'Selecione uma receita válida da API ou das suas receitas.';
      return;
    }

    const payload = { recipeId: this.newRecipeId || 0, recipeTitle: this.newRecipeTitle };
    this.favoritesService.addFavorite(payload).subscribe({ next: () => { this.newRecipeTitle = ''; this.newRecipeId = null; this.loadFavorites(); }, error: () => this.error = 'Falha ao adicionar favorito' });
  }

  startEdit(f: any): void { this.editing = { ...f }; }
  saveEdit(): void {
    // no backend update endpoint; update local store directly
    const local = this.favoritesService as any;
    const stored = (local.local.get('favorites') || []).map((x: any) => x.id === this.editing.id ? this.editing : x);
    local.local.set('favorites', stored);
    this.loadFavorites();
    this.editing = null;
  }
  cancelEdit(): void { this.editing = null; }
}

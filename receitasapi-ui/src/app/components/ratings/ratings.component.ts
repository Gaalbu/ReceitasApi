import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RatingsService } from '../../services/ratings.service';
import { RecipeOption, RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ratings.component.html'
})
export class RatingsComponent implements OnInit {
  ratings: any[] = [];
  error: string | null = null;
  newRecipeId: number | null = null;
  newScore: number | null = null;
  editing: any = null;
  recipeSearch = '';
  availableRecipes: RecipeOption[] = [];
  loadingRecipes = false;
  loadingRatings = false;
  savingRating = false;

  constructor(private ratingsService: RatingsService, private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.loadRatings();
    this.loadAvailableRecipes();
  }

  loadRatings(): void {
    this.loadingRatings = true;
    this.ratingsService.myRatings().subscribe({
      next: data => {
        this.ratings = data || [];
        this.loadingRatings = false;
      },
      error: () => {
        this.error = 'Não foi possível carregar avaliações';
        this.loadingRatings = false;
      }
    });
  }

  loadAvailableRecipes(term = ''): void {
    this.loadingRecipes = true;
    const preservedSelection = this.preservedSelectedRecipe();
    this.recipeService.getRecipeOptions(term).subscribe({
      next: (options) => {
        this.availableRecipes = this.mergeSelectedRecipe(options || [], preservedSelection);
        this.loadingRecipes = false;
      },
      error: () => {
        this.error = 'Não foi possível carregar receitas válidas.';
        this.loadingRecipes = false;
      }
    });
  }

  searchRecipes(): void {
    this.loadAvailableRecipes(this.recipeSearch);
  }

  recipeLabel(recipeId: number | null): string {
    const selected = this.availableRecipes.find((recipe) => recipe.id === recipeId);
    return selected?.label || (recipeId ? `Receita ${recipeId}` : 'Receita inválida');
  }

  private preservedSelectedRecipe(): RecipeOption | null {
    if (this.newRecipeId === null) {
      return null;
    }

    return this.availableRecipes.find((recipe) => recipe.id === this.newRecipeId) || {
      id: this.newRecipeId,
      label: `Receita #${this.newRecipeId}`,
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

  add(): void {
    if (!this.newRecipeId || !this.newScore) { this.error = 'Informe receita e nota'; return; }
    const selected = this.availableRecipes.find((recipe) => recipe.id === this.newRecipeId);
    if (!selected) {
      this.error = 'Selecione uma receita válida da API ou das suas receitas.';
      return;
    }
    const payload = { rating: this.newScore };
    this.savingRating = true;
    this.ratingsService.addRating(this.newRecipeId, payload).subscribe({
      next: () => {
        this.newRecipeId = null;
        this.newScore = null;
        this.savingRating = false;
        this.loadRatings();
      },
      error: () => {
        this.savingRating = false;
        this.error = 'Falha ao salvar avaliação';
      }
    });
  }

  startEdit(r: any): void { this.editing = { ...r }; }
  saveEdit(): void {
    // no backend update endpoint: update local store
    this.ratingsService.updateRatingLocally(this.editing);
    this.loadRatings();
    this.editing = null;
  }
  cancelEdit(): void { this.editing = null; }
}

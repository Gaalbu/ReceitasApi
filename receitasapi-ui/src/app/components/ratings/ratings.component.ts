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

  constructor(private ratingsService: RatingsService, private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.loadRatings();
    this.loadAvailableRecipes();
  }

  loadRatings(): void {
    this.ratingsService.myRatings().subscribe({
      next: data => this.ratings = data || [],
      error: () => this.error = 'Não foi possível carregar avaliações'
    });
  }

  loadAvailableRecipes(term = ''): void {
    this.loadingRecipes = true;
    this.recipeService.getRecipeOptions(term).subscribe({
      next: (options) => {
        this.availableRecipes = options || [];
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

  add(): void {
    if (!this.newRecipeId || !this.newScore) { this.error = 'Informe receita e nota'; return; }
    const selected = this.availableRecipes.find((recipe) => recipe.id === this.newRecipeId);
    if (!selected) {
      this.error = 'Selecione uma receita válida da API ou das suas receitas.';
      return;
    }
    const payload = { rating: this.newScore };
    this.ratingsService.addRating(this.newRecipeId, payload).subscribe({ next: () => { this.newRecipeId = null; this.newScore = null; this.loadRatings(); }, error: () => this.error = 'Falha ao salvar avaliação' });
  }

  startEdit(r: any): void { this.editing = { ...r }; }
  saveEdit(): void {
    // no backend update endpoint: update local store
    const local = (this.ratingsService as any).local;
    const arr = (local.get('ratings') || []).map((x: any) => x.id === this.editing.id ? this.editing : x);
    local.set('ratings', arr);
    this.loadRatings();
    this.editing = null;
  }
  cancelEdit(): void { this.editing = null; }
}

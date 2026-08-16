import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { RecipeService } from '../../services/recipe.service';
import { CommonModule } from '@angular/common';
import { FeedbackComponent } from '../feedback/feedback.component';

@Component({
  selector: 'app-recipe',
  standalone: true,
  templateUrl: './recipe.component.html',
  imports: [ReactiveFormsModule, CommonModule, FeedbackComponent]
})
export class RecipeComponent implements OnInit {
  searchForm!: FormGroup;
  recipeForm!: FormGroup;
  results: any[] = [];
  myRecipes: any[] = [];
  loadingMyRecipes = false;
  savingRecipe = false;
  recipeMessage = '';
  recipeError = '';
  editingRecipeId: number | null = null;
  selectedRecipeId: number | null = null;
  selectedRecipeName = '';

  constructor(private fb: FormBuilder, private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({ q: ['', Validators.required] });
    this.recipeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      ingredients: ['', [Validators.required, Validators.maxLength(500)]],
      instructions: ['', [Validators.required, Validators.maxLength(4000)]],
      prep_time: [15, [Validators.required, Validators.min(1), Validators.max(9999)]]
    });
    this.loadMyRecipes();
  }

  loadMyRecipes(): void {
    this.loadingMyRecipes = true;
    this.recipeService.listMyRecipes().subscribe({
      next: (recipes) => {
        this.myRecipes = recipes || [];
        this.loadingMyRecipes = false;
      },
      error: () => {
        this.recipeError = 'Nao foi possivel carregar suas receitas.';
        this.loadingMyRecipes = false;
      }
    });
  }

  search() {
    if (this.searchForm.invalid) {
      console.warn('Formulário inválido');
      return;
    }
    const term = this.searchForm.value.q;

    this.recipeService.searchExternal(term).subscribe({
      next: (res: any) => {
        this.results = res?.meals || [];
      },
      error: (err: any) => {
        console.error('✗ Erro na busca:', err);
        console.error('Status:', err?.status);
        console.error('Message:', err?.message);
        this.results = [];
      }
    });
  }

  submitRecipe(): void {
    if (this.recipeForm.invalid) {
      this.recipeError = 'Preencha os campos obrigatorios da receita.';
      return;
    }

    const payload = {
      name: this.recipeForm.value.title,
      description: this.recipeForm.value.ingredients,
      instructions: this.recipeForm.value.instructions,
      prep_time: Number(this.recipeForm.value.prep_time || 0)
    };

    this.savingRecipe = true;
    const request$ = this.editingRecipeId
      ? this.recipeService.updateRecipe(this.editingRecipeId, payload)
      : this.recipeService.createMyRecipe(payload);

    request$.subscribe({
      next: (savedRecipe) => {
        if (this.editingRecipeId) {
          this.myRecipes = this.myRecipes.map((recipe) => recipe.id === this.editingRecipeId ? savedRecipe : recipe);
          this.recipeMessage = 'Receita atualizada com sucesso.';
        } else {
          this.myRecipes = [savedRecipe, ...this.myRecipes];
          this.recipeMessage = 'Receita criada com sucesso.';
        }

        this.recipeForm.reset({ title: '', ingredients: '', instructions: '', prep_time: 15 });
        this.editingRecipeId = null;
        this.recipeError = '';
        this.savingRecipe = false;
      },
      error: () => {
        this.recipeError = 'Falha ao salvar a receita.';
        this.savingRecipe = false;
      }
    });
  }

  startEdit(recipe: any): void {
    this.editingRecipeId = recipe.id;
    this.recipeMessage = '';
    this.recipeError = '';
    this.recipeForm.setValue({
      title: recipe.name || '',
      ingredients: recipe.description || '',
      instructions: recipe.instructions || '',
      prep_time: recipe.prepTime ?? 15
    });
  }

  cancelEdit(): void {
    this.editingRecipeId = null;
    this.recipeForm.reset({ title: '', ingredients: '', instructions: '', prep_time: 15 });
    this.recipeError = '';
    this.recipeMessage = '';
  }

  deleteOwnRecipe(recipe: any): void {
    if (!globalThis.confirm(`Excluir a receita "${recipe.name}"?`)) {
      return;
    }

    this.recipeService.deleteRecipe(recipe.id).subscribe({
      next: () => {
        this.myRecipes = this.myRecipes.filter((item) => item.id !== recipe.id);
        if (this.editingRecipeId === recipe.id) {
          this.cancelEdit();
        }
        this.recipeMessage = 'Receita removida com sucesso.';
      },
      error: () => {
        this.recipeError = 'Falha ao remover a receita.';
      }
    });
  }

  trackByMeal(index: number, item: any) {
    return item?.idMeal || item?.id || item?.external_api_id || index;
  }

  extractRecipeId(item: any): number | null {
    const rawId = item?.id || item?.idMeal || item?.external_api_id;
    const id = Number(rawId);
    return Number.isNaN(id) || id <= 0 ? null : id;
  }

  openRatingFor(item: any) {
    this.selectedRecipeId = this.extractRecipeId(item);
    this.selectedRecipeName = item?.strMeal || item?.name || `Receita #${this.selectedRecipeId ?? ''}`;
  }

  clearRatingSelection() {
    this.selectedRecipeId = null;
    this.selectedRecipeName = '';
  }

  trackByRecipeId(_: number, recipe: any): number {
    return recipe?.id;
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FavoritePayload, RecipeService, RecipePayload } from '../../services/recipe.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FeedbackComponent } from '../feedback/feedback.component';

type MyRecipe = {
  id: number;
  name: string;
  description: string;
  instructions: string;
  prepTime?: number | null;
};

type FavoriteItem = {
  id: number;
  externalRecipeId: string;
  recipeName: string;
  imageUrl?: string | null;
};

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
  myRecipes: MyRecipe[] = [];
  myFavorites: FavoriteItem[] = [];
  selectedRecipeId: number | null = null;
  selectedRecipeName = '';
  editingRecipeId: number | null = null;
  message = '';

  constructor(private fb: FormBuilder, private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({ q: ['', Validators.required] });
    this.recipeForm = this.fb.group({
      title: ['', Validators.required],
      ingredients: ['', Validators.required],
      instructions: ['', Validators.required],
      prep_time: [0, Validators.required]
    });

    this.loadMyRecipes();
    this.loadMyFavorites();
  }

  search() {
    if (this.searchForm.invalid) {
      console.warn('Formulário inválido');
      return;
    }
    const term = this.searchForm.value.q;
    const url = `/api/recipes/search?name=${encodeURIComponent(term)}`;
    console.log('Buscando por:', term);
    console.log('URL:', url);
    
    this.recipeService.searchExternal(term).subscribe({
      next: (res: any) => {
        console.log('✓ Resposta recebida:', res);
        this.results = res?.meals || [];
        console.log('✓ Results atualizado com', this.results.length, 'itens');
      },
      error: (err: any) => {
        console.error('✗ Erro na busca:', err);
        console.error('Status:', err?.status);
        console.error('Message:', err?.message);
        this.results = [];
      },
      complete: () => {
        console.log('✓ Busca completada');
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

  loadMyRecipes() {
    this.recipeService.getMyRecipes().subscribe({
      next: (recipes) => {
        this.myRecipes = Array.isArray(recipes) ? recipes : [];
      },
      error: () => {
        this.myRecipes = [];
      }
    });
  }

  loadMyFavorites() {
    this.recipeService.getMyFavorites().subscribe({
      next: (favorites) => {
        this.myFavorites = Array.isArray(favorites)
          ? favorites.map((favorite: any) => ({
              id: Number(favorite?.id ?? 0),
              externalRecipeId: String(favorite?.externalRecipeId ?? favorite?.external_recipe_id ?? ''),
              recipeName: String(favorite?.recipeName ?? favorite?.recipe_name ?? 'Receita favorita'),
              imageUrl: favorite?.imageUrl ?? favorite?.image_url ?? null
            }))
          : [];
      },
      error: () => {
        this.myFavorites = [];
      }
    });
  }

  addFavorite(item: any) {
    const recipeId = this.extractRecipeId(item);
    if (!recipeId) {
      this.message = 'Não foi possível salvar sem um ID válido.';
      return;
    }

    const payload: FavoritePayload = {
      external_recipe_id: String(recipeId),
      recipe_name: item?.strMeal || item?.name || `Receita #${recipeId}`,
      image_url: item?.strMealThumb || item?.thumbnail || ''
    };

    this.recipeService.addFavorite(payload).subscribe({
      next: () => {
        this.message = 'Favorito salvo com sucesso!';
        this.loadMyFavorites();
      },
      error: () => {
        this.message = 'Erro ao salvar favorito.';
      }
    });
  }

  deleteFavorite(favorite: FavoriteItem) {
    const shouldDelete = typeof window === 'undefined' ? true : window.confirm(`Remover "${favorite.recipeName}" dos favoritos?`);
    if (!shouldDelete) {
      return;
    }

    this.recipeService.deleteFavorite(favorite.id).subscribe({
      next: () => {
        this.message = 'Favorito removido com sucesso!';
        this.loadMyFavorites();
      },
      error: () => {
        this.message = 'Erro ao remover favorito.';
      }
    });
  }

  submitMyRecipe() {
    if (this.recipeForm.invalid) {
      this.message = 'Preencha todos os campos da receita.';
      return;
    }

    const formValue = this.recipeForm.value;
    const payload: RecipePayload = {
      name: formValue.title,
      description: formValue.ingredients,
      instructions: formValue.instructions,
      prep_time: Number(formValue.prep_time || 0)
    };

    const request$ = this.editingRecipeId
      ? this.recipeService.updateMyRecipe(this.editingRecipeId, payload)
      : this.recipeService.createMyRecipe(payload);

    request$.subscribe({
      next: () => {
        this.message = this.editingRecipeId
          ? 'Receita atualizada com sucesso!'
          : 'Receita criada com sucesso!';
        this.editingRecipeId = null;
        this.recipeForm.reset({ prep_time: 0 });
        this.loadMyRecipes();
      },
      error: () => {
        this.message = this.editingRecipeId
          ? 'Erro ao atualizar a receita.'
          : 'Erro ao criar a receita.';
      }
    });
  }

  editMyRecipe(recipe: MyRecipe) {
    this.editingRecipeId = recipe.id;
    this.recipeForm.setValue({
      title: recipe.name,
      ingredients: recipe.description,
      instructions: recipe.instructions,
      prep_time: recipe.prepTime ?? 0
    });
    this.message = 'Editando receita selecionada.';
  }

  cancelEdit() {
    this.editingRecipeId = null;
    this.recipeForm.reset({ prep_time: 0 });
    this.message = 'Edição cancelada.';
  }

  deleteMyRecipe(recipe: MyRecipe) {
    const shouldDelete = typeof window === 'undefined' ? true : window.confirm(`Excluir a receita "${recipe.name}"?`);
    if (!shouldDelete) {
      return;
    }

    this.recipeService.deleteMyRecipe(recipe.id).subscribe({
      next: () => {
        this.message = 'Receita excluída com sucesso!';
        this.loadMyRecipes();
        if (this.editingRecipeId === recipe.id) {
          this.cancelEdit();
        }
      },
      error: () => {
        this.message = 'Erro ao excluir a receita.';
      }
    });
  }

  trackByMyRecipe(index: number, item: MyRecipe) {
    return item.id || index;
  }

  trackByFavorite(index: number, item: FavoriteItem) {
    return item.id || index;
  }
}

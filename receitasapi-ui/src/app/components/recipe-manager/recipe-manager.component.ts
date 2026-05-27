import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-recipe-manager',
  standalone: true,
  templateUrl: './recipe-manager.component.html',
  styleUrl: './recipe-manager.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class RecipeManagerComponent implements OnInit {
  recipes: any[] = [];
  loading = false;
  saving = false;
  error = '';
  message = '';
  editingRecipeId: number | null = null;

  recipeForm!: FormGroup;

  constructor(private fb: FormBuilder, private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.recipeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      ingredients: ['', [Validators.required, Validators.maxLength(500)]],
      instructions: ['', [Validators.required, Validators.maxLength(4000)]],
      prep_time: [15, [Validators.required, Validators.min(1), Validators.max(9999)]]
    });
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.loading = true;
    this.error = '';

    this.recipeService.listMyRecipes().subscribe({
      next: (recipes) => {
        this.recipes = recipes || [];
        this.loading = false;
      },
      error: (error) => {
        this.error = error?.error?.message || 'Não foi possível carregar suas receitas.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.recipeForm.invalid) {
      this.error = 'Preencha os campos obrigatórios da receita.';
      this.message = '';
      return;
    }

    const formValue = this.recipeForm.getRawValue();
    const payload = {
      name: formValue.title,
      description: formValue.ingredients,
      instructions: formValue.instructions,
      prep_time: Number(formValue.prep_time || 0)
    };

    this.saving = true;
    this.error = '';
    this.message = '';

    const request$ = this.editingRecipeId
      ? this.recipeService.updateMyRecipe(this.editingRecipeId, payload)
      : this.recipeService.createMyRecipe(payload);

    request$.subscribe({
      next: (savedRecipe) => {
        this.message = this.editingRecipeId ? 'Receita atualizada com sucesso.' : 'Receita criada com sucesso.';
        if (this.editingRecipeId) {
          this.recipes = this.recipes.map((recipe) => recipe.id === this.editingRecipeId ? savedRecipe : recipe);
        } else {
          this.recipes = [savedRecipe, ...this.recipes];
        }
        this.recipeForm.reset({
          title: '',
          ingredients: '',
          instructions: '',
          prep_time: 15
        });
        this.editingRecipeId = null;
        this.saving = false;
      },
      error: (error) => {
        this.error = error?.error?.message || 'Falha ao salvar a receita.';
        this.saving = false;
      }
    });
  }

  startEdit(recipe: any): void {
    this.editingRecipeId = recipe.id;
    this.message = '';
    this.error = '';
    this.recipeForm.setValue({
      title: recipe.name || '',
      ingredients: recipe.description || '',
      instructions: recipe.instructions || '',
      prep_time: recipe.prepTime ?? 15
    });
  }

  cancelEdit(): void {
    this.editingRecipeId = null;
    this.recipeForm.reset({
      title: '',
      ingredients: '',
      instructions: '',
      prep_time: 15
    });
    this.message = '';
    this.error = '';
  }

  deleteRecipe(recipe: any): void {
    const confirmed = globalThis.confirm(`Excluir a receita "${recipe.name}"?`);
    if (!confirmed) {
      return;
    }

    this.error = '';
    this.message = '';

    this.recipeService.deleteMyRecipe(recipe.id).subscribe({
      next: () => {
        if (this.editingRecipeId === recipe.id) {
          this.cancelEdit();
        }
        this.recipes = this.recipes.filter((item) => item.id !== recipe.id);
        this.message = 'Receita removida com sucesso.';
      },
      error: (error) => {
        this.error = error?.error?.message || 'Falha ao remover a receita.';
      }
    });
  }

  patchRecipe(recipe: any): void {
    this.startEdit(recipe);
    this.error = '';
  }

  trackByRecipeId(_: number, recipe: any): number {
    return recipe?.id;
  }
}
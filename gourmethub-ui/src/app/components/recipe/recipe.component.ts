import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recipe',
  standalone: true,
  templateUrl: './recipe.component.html',
  imports: [ReactiveFormsModule, CommonModule]
})
export class RecipeComponent {
  searchForm!: FormGroup;
  createForm!: FormGroup;
  results: any[] = [];
  message = '';

  constructor(private fb: FormBuilder, private recipeService: RecipeService) {
    this.searchForm = this.fb.group({ q: ['', Validators.required] });
    this.createForm = this.fb.group({ name: ['', Validators.required], description: [''], instructions: [''] });
  }

  search() {
    if (this.searchForm.invalid) return;
    this.recipeService.searchExternal(this.searchForm.value.q).subscribe((res: any) => {
      this.results = res?.meals || [];
    });
  }

  create() {
    if (this.createForm.invalid) return;
    this.recipeService.createMyRecipe(this.createForm.value).subscribe({
      next: (r) => (this.message = 'Receita criada'),
      error: () => (this.message = 'Erro ao criar')
    });
  }
}

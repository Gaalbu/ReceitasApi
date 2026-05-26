import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-recipe',
  standalone: true,
  templateUrl: './create-recipe.component.html',
  imports: [ReactiveFormsModule, CommonModule]
})
export class CreateRecipeComponent implements OnInit {
  createForm!: FormGroup;
  message = '';

  constructor(private fb: FormBuilder, private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.createForm = this.fb.group({
      title: ['', Validators.required],
      ingredients: ['', Validators.required],
      instructions: ['', Validators.required],
      prep_time: [0, Validators.required]
    });
  }

  create() {
    if (this.createForm.invalid) {
      this.message = 'Preencha todos os campos corretamente';
      return;
    }

    const formValue = this.createForm.value;
    const payload = {
      name: formValue.title,
      description: formValue.ingredients,
      instructions: formValue.instructions,
      prep_time: Number(formValue.prep_time || 0)
    };

    this.recipeService.createMyRecipe(payload).subscribe({
      next: (r) => {
        this.message = 'Receita criada com sucesso!';
        this.createForm.reset();
      },
      error: (err) => {
        console.error('Erro ao criar receita:', err);
        this.message = 'Erro ao criar a receita';
      }
    });
  }
}

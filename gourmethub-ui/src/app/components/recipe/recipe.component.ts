import { Component, OnInit } from '@angular/core';
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
export class RecipeComponent implements OnInit {
  searchForm!: FormGroup;
  createForm!: FormGroup;
  results: any[] = [];
  message = '';

  constructor(private fb: FormBuilder, private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({ q: ['', Validators.required] });
    this.createForm = this.fb.group({
      title: ['', Validators.required],
      ingredients: ['', Validators.required],
      instructions: ['', Validators.required],
      prep_time: [0, Validators.required]
    });
  }

  search() {
    if (this.searchForm.invalid) {
      console.warn('Formulário inválido');
      return;
    }
    const term = this.searchForm.value.q;
    const url = `http://localhost:8080/recipes/search?name=${encodeURIComponent(term)}`;
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

  create() {
    if (this.createForm.invalid) return;
    this.recipeService.createMyRecipe(this.createForm.value).subscribe({
      next: (r) => (this.message = 'Receita criada'),
      error: () => (this.message = 'Erro ao criar')
    });
  }

  trackByMeal(index: number, item: any) {
    return item?.idMeal || item?.id || item?.external_api_id || index;
  }
}

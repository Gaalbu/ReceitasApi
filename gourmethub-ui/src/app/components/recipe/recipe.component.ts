import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { ReactiveFormsModule } from '@angular/forms';
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
  results: any[] = [];
  selectedRecipeId: number | null = null;
  selectedRecipeName = '';

  constructor(private fb: FormBuilder, private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({ q: ['', Validators.required] });
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
}

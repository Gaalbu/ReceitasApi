import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { resolveApiBase } from '../../services/api-base';

type MyRecipeReview = {
  id: number;
  recipeId: number;
  recipeName: string;
  rating: number;
  comment: string;
};

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  imports: [CommonModule, ReactiveFormsModule]
})
export class FeedbackComponent implements OnInit {
  @Input() recipeId?: number;
  @Input() recipeName?: string;

  reviewForm!: FormGroup;
  myReviews: MyRecipeReview[] = [];
  loadingReviews = false;
  private readonly localReviewsKey = 'gourmethub.recipe-reviews';

  message = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.reviewForm = this.fb.group({ rating: [5, [Validators.min(1), Validators.max(5)]], comment: [''] });
  }

  ngOnInit() {
    if (typeof window === 'undefined') {
      this.loadingReviews = false;
      return;
    }

    if (!this.recipeId) {
      this.loadMyRecipeReviews();
    }
  }

  private endpoint(path: string): string {
    return `${resolveApiBase()}${path}`;
  }

  loadMyRecipeReviews() {
    this.loadingReviews = true;
    this.http.get<MyRecipeReview[]>(this.endpoint('/recipes/ratings/me')).subscribe({
      next: (reviews) => {
        this.myReviews = reviews || [];
        this.loadingReviews = false;
      },
      error: () => {
        this.myReviews = this.loadLocalReviews();
        this.message = this.myReviews.length
          ? 'Mostrando reviews locais salvas no navegador.'
          : 'Ainda nao ha reviews salvas para este usuario.';
        this.loadingReviews = false;
      }
    });
  }

  submitRating() {
    if (!this.recipeId) return;
    const payload = { rating: this.reviewForm.value.rating, comment: this.reviewForm.value.comment };
    this.http.post(this.endpoint(`/recipes/${this.recipeId}/ratings`), payload).subscribe({
      next: () => {
        this.saveLocalReview(payload.rating, payload.comment || '');
        this.message = 'Avaliação enviada';
      },
      error: () => (this.message = 'Erro ao enviar')
    });
  }

  private loadLocalReviews(): MyRecipeReview[] {
    try {
      const raw = localStorage.getItem(this.localReviewsKey);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveLocalReview(rating: number, comment: string) {
    if (!this.recipeId) {
      return;
    }

    const existing = this.loadLocalReviews();
    const entry: MyRecipeReview = {
      id: Date.now(),
      recipeId: this.recipeId,
      recipeName: this.recipeName || `Receita #${this.recipeId}`,
      rating,
      comment
    };

    const updated = [entry, ...existing].slice(0, 100);
    try {
      localStorage.setItem(this.localReviewsKey, JSON.stringify(updated));
    } catch {
      // Ignore storage failures.
    }
  }

}

import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { resolveApiBase } from '../../services/api-base';
import { timeout } from 'rxjs';
import { FeedbackService } from '../../services/feedback.service';
import { AuthService } from '../../services/auth.service';

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
  systemReviews: any[] = [];
  loadingReviews = false;
  loadingSystemReviews = false;
  editingSystemReviewId: number | null = null;
  private readonly localReviewsKey = 'receitasapi.recipe-reviews';
  private loadingFallbackTimer?: number;

  message = '';
  systemMessage = '';
  systemError = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private feedbackService: FeedbackService, private authService: AuthService) {
    this.reviewForm = this.fb.group({ rating: [5, [Validators.min(1), Validators.max(5)]], comment: [''] });
  }

  ngOnInit() {
    if (typeof window === 'undefined') {
      this.loadingReviews = false;
      return;
    }

    if (!this.recipeId) {
      this.loadSystemReviews();
    }
  }

  private endpoint(path: string): string {
    return `${resolveApiBase()}${path}`;
  }

  loadMyRecipeReviews() {
    this.loadingReviews = true;
    const local = this.loadLocalReviews();
    this.myReviews = local;
    this.message = local.length ? 'Mostrando reviews locais salvas no navegador.' : '';
    this.loadingReviews = false;

    if (typeof window !== 'undefined') {
      this.loadingFallbackTimer = window.setTimeout(() => {
        if (this.loadingReviews) {
          this.myReviews = local;
          this.message = this.myReviews.length
            ? 'Mostrando reviews locais salvas no navegador.'
            : 'Ainda nao ha reviews salvas para este usuario.';
          this.loadingReviews = false;
        }
      }, 3000);
    }

    this.http.get<any[]>(this.endpoint('/recipes/ratings/me')).pipe(timeout(5000)).subscribe({
      next: (reviews) => {
        try {
          const serverReviews = Array.isArray(reviews) ? reviews : [];
          const normalized = serverReviews.map((review) => this.normalizeReview(review));
          this.myReviews = this.mergeReviews(local, normalized);
          this.message = this.myReviews.length && local.length && normalized.length
            ? 'Mostrando reviews locais e do servidor.'
            : (local.length ? 'Mostrando reviews locais salvas no navegador.' : '');
        } catch {
          this.myReviews = local;
          this.message = this.myReviews.length
            ? 'Mostrando reviews locais salvas no navegador.'
            : 'Ainda nao ha reviews salvas para este usuario.';
        } finally {
          this.clearLoadingFallback();
          this.loadingReviews = false;
        }
      },
      error: () => {
        this.clearLoadingFallback();
        this.myReviews = local;
        this.message = this.myReviews.length
          ? 'Mostrando reviews locais salvas no navegador.'
          : 'Ainda nao ha reviews salvas para este usuario.';
        this.loadingReviews = false;
      }
    });
  }

  loadSystemReviews(): void {
    this.loadingSystemReviews = true;
    this.feedbackService.getReviews().subscribe({
      next: (reviews) => {
        this.systemReviews = Array.isArray(reviews) ? reviews : [];
        this.loadingSystemReviews = false;
      },
      error: () => {
        this.systemError = 'Nao foi possivel carregar os reviews.';
        this.loadingSystemReviews = false;
      }
    });
  }

  private clearLoadingFallback() {
    if (this.loadingFallbackTimer !== undefined && typeof window !== 'undefined') {
      window.clearTimeout(this.loadingFallbackTimer);
      this.loadingFallbackTimer = undefined;
    }
  }

  submitRating() {
    if (!this.recipeId) return;
    const payload = { rating: this.reviewForm.value.rating, comment: this.reviewForm.value.comment };
    this.http.post(this.endpoint(`/recipes/${this.recipeId}/ratings`), payload).subscribe({
      next: () => {
        this.saveLocalReview(payload.rating, payload.comment || '');
        // Update visible list immediately
        const entry: MyRecipeReview = {
          id: Date.now(),
          recipeId: this.recipeId!,
          recipeName: this.recipeName || `Receita #${this.recipeId}`,
          rating: payload.rating,
          comment: payload.comment || ''
        };
        this.myReviews = this.upsertReview(entry, this.myReviews);
        this.message = 'Avaliação enviada';
      },
      error: () => {
        // Persist locally so the user still sees their review even if server rejects
        this.saveLocalReview(payload.rating, payload.comment || '');
        const entry: MyRecipeReview = {
          id: Date.now(),
          recipeId: this.recipeId!,
          recipeName: this.recipeName || `Receita #${this.recipeId}`,
          rating: payload.rating,
          comment: payload.comment || ''
        };
        this.myReviews = this.upsertReview(entry, this.myReviews);
        this.message = 'Não foi possível enviar ao servidor — review salva localmente.';
      }
    });
  }

  submitSystemReview(): void {
    if (this.reviewForm.invalid) {
      this.systemError = 'Preencha nota e comentario.';
      return;
    }

    const payload = { rating: this.reviewForm.value.rating, comment: this.reviewForm.value.comment };
    const request$ = this.editingSystemReviewId
      ? this.feedbackService.updateReview(this.editingSystemReviewId, payload)
      : this.feedbackService.createReview(payload);

    request$.subscribe({
      next: (savedReview) => {
        if (this.editingSystemReviewId) {
          this.systemReviews = this.systemReviews.map((review) => review.id === this.editingSystemReviewId ? savedReview : review);
          this.systemMessage = 'Review atualizado com sucesso.';
        } else {
          this.systemReviews = [savedReview, ...this.systemReviews];
          this.systemMessage = 'Review enviado com sucesso.';
        }

        this.reviewForm.reset({ rating: 5, comment: '' });
        this.editingSystemReviewId = null;
        this.systemError = '';
      },
      error: () => {
        this.systemError = 'Nao foi possivel salvar o review.';
      }
    });
  }

  isOwnSystemReview(review: any): boolean {
    return review?.user?.username && review.user.username === this.authService.getUsername();
  }

  editSystemReview(review: any): void {
    this.editingSystemReviewId = review.id;
    this.systemMessage = '';
    this.systemError = '';
    this.reviewForm.setValue({ rating: review.rating ?? 5, comment: review.comment ?? '' });
  }

  cancelSystemEdit(): void {
    this.editingSystemReviewId = null;
    this.reviewForm.reset({ rating: 5, comment: '' });
  }

  deleteSystemReview(review: any): void {
    if (!globalThis.confirm('Excluir este review?')) {
      return;
    }

    this.feedbackService.deleteReview(review.id).subscribe({
      next: () => {
        this.systemReviews = this.systemReviews.filter((item) => item.id !== review.id);
        if (this.editingSystemReviewId === review.id) {
          this.cancelSystemEdit();
        }
        this.systemMessage = 'Review removido com sucesso.';
      },
      error: () => {
        this.systemError = 'Nao foi possivel excluir o review.';
      }
    });
  }

  private normalizeReview(review: any): MyRecipeReview {
    const recipeId = review.recipeId ?? review.recipe?.id ?? review.recipe_id ?? 0;
    const recipeName = review.recipeName
      || review.recipe?.title
      || review.recipe?.name
      || review.recipe_name
      || review.recipeTitle
      || review.name
      || `Receita #${recipeId || '??'}`;

    return {
      id: review.id ?? Date.now(),
      recipeId,
      recipeName,
      rating: review.rating,
      comment: review.comment
    };
  }

  private mergeReviews(primary: MyRecipeReview[], secondary: MyRecipeReview[]): MyRecipeReview[] {
    const merged = new Map<string, MyRecipeReview>();
    [...secondary, ...primary].forEach((review) => {
      merged.set(this.reviewKey(review), review);
    });
    return Array.from(merged.values()).sort((left, right) => right.id - left.id);
  }

  private upsertReview(review: MyRecipeReview, reviews: MyRecipeReview[]): MyRecipeReview[] {
    const merged = this.mergeReviews([review], reviews);
    return merged;
  }

  private reviewKey(review: MyRecipeReview): string {
    return [review.recipeId, review.rating, (review.comment || '').trim().toLowerCase()].join('|');
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

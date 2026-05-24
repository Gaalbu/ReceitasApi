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

  reviewForm!: FormGroup;
  base = resolveApiBase();

  myReviews: MyRecipeReview[] = [];
  loadingReviews = false;

  message = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.reviewForm = this.fb.group({ rating: [5, [Validators.min(1), Validators.max(5)]], comment: [''] });
  }

  ngOnInit() {
    if (!this.recipeId) {
      this.loadMyRecipeReviews();
    }
  }

  loadMyRecipeReviews() {
    this.loadingReviews = true;
    this.http.get<MyRecipeReview[]>(`${this.base}/recipes/ratings/me`).subscribe({
      next: (reviews) => {
        this.myReviews = reviews || [];
        this.loadingReviews = false;
      },
      error: () => {
        this.message = 'Erro ao carregar suas reviews';
        this.loadingReviews = false;
      }
    });
  }

  submitRating() {
    if (!this.recipeId) return;
    const payload = { rating: this.reviewForm.value.rating, comment: this.reviewForm.value.comment };
    this.http.post(`${this.base}/recipes/${this.recipeId}/ratings`, payload).subscribe({
      next: () => (this.message = 'Avaliação enviada'),
      error: () => (this.message = 'Erro ao enviar')
    });
  }

}

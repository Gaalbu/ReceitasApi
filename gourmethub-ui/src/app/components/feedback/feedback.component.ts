import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  imports: [CommonModule, ReactiveFormsModule]
})
export class FeedbackComponent {
  @Input() recipeId?: number;

  reviewForm!: FormGroup;
  systemForm!: FormGroup;

  base = 'http://localhost:8080';

  message = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.reviewForm = this.fb.group({ rating: [5, [Validators.min(1), Validators.max(5)]], comment: [''] });
    this.systemForm = this.fb.group({ comment: ['', Validators.required] });
  }

  submitRating() {
    if (!this.recipeId) return;
    const payload = { rating: this.reviewForm.value.rating, comment: this.reviewForm.value.comment };
    this.http.post(`${this.base}/recipes/${this.recipeId}/ratings`, payload).subscribe({
      next: () => (this.message = 'Avaliação enviada'),
      error: () => (this.message = 'Erro ao enviar')
    });
  }

  submitSystemReview() {
    if (this.systemForm.invalid) return;
    this.http.post(`${this.base}/system-reviews`, this.systemForm.value).subscribe({
      next: () => (this.message = 'Feedback enviado'),
      error: () => (this.message = 'Erro ao enviar')
    });
  }
}

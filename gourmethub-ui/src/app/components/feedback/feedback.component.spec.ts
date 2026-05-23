import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FeedbackComponent } from './feedback.component';

describe('FeedbackComponent', () => {
  let component: FeedbackComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackComponent, HttpClientTestingModule]
    }).compileComponents();

    const fixture = TestBed.createComponent(FeedbackComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should skip recipe rating submit when recipeId is missing', () => {
    component.recipeId = undefined;
    component.submitRating();

    httpMock.expectNone('/api/recipes/undefined/ratings');
  });

  it('should submit recipe rating when recipeId exists', () => {
    component.recipeId = 12;
    component.reviewForm.setValue({ rating: 5, comment: 'Top' });

    component.submitRating();

    const req = httpMock.expectOne('/api/recipes/12/ratings');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ rating: 5, comment: 'Top' });
    req.flush({ ok: true });
    expect(component.message).toBe('Avaliação enviada');
  });

  it('should submit system review when valid', () => {
    component.systemForm.setValue({ comment: 'Excelente app' });

    component.submitSystemReview();

    const req = httpMock.expectOne('/api/system-reviews');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ comment: 'Excelente app' });
    req.flush({ ok: true });
    expect(component.message).toBe('Feedback enviado');
  });
});

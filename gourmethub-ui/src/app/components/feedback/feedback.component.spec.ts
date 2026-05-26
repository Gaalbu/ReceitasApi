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
    component.recipeId = 1;
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
    component.recipeId = undefined;
    component.loadMyRecipeReviews();

    const req = httpMock.expectOne('/api/recipes/ratings/me');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, recipeId: 7, recipeName: 'Bolo', rating: 4, comment: 'Bom' }]);

    expect(component.myReviews.length).toBe(2);
    expect(component.message).toContain('reviews');
  });

  it('should save local reviews and merge them with server results', () => {
    component.recipeId = 12;
    component.recipeName = 'Bolo';
    component.reviewForm.setValue({ rating: 4, comment: 'Bom' });

    component.submitRating();

    const postReq = httpMock.expectOne('/api/recipes/12/ratings');
    postReq.flush({ ok: true });

    component.recipeId = undefined;
    component.loadMyRecipeReviews();

    const getReq = httpMock.expectOne('/api/recipes/ratings/me');
    getReq.flush([{ id: 99, recipeId: 12, recipeName: 'Bolo', rating: 4, comment: 'Bom' }]);

    expect(component.myReviews.length).toBe(2);
    expect(component.message).toContain('servidor');
  });

  it('should preserve local reviews when server call fails', () => {
    component.recipeId = undefined;
    localStorage.setItem('receitasapi.recipe-reviews', JSON.stringify([
      { id: 1, recipeId: 2, recipeName: 'Pao', rating: 5, comment: 'Top' }
    ]));

    component.loadMyRecipeReviews();

    const req = httpMock.expectOne('/api/recipes/ratings/me');
    req.flush('fail', { status: 500, statusText: 'Server Error' });

    expect(component.myReviews.length).toBe(1);
    expect(component.message).toContain('salvas no navegador');
  });
});

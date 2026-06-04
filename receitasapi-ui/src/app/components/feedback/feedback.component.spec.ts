import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { FeedbackComponent } from './feedback.component';
import { FeedbackService } from '../../services/feedback.service';
import { AuthService } from '../../services/auth.service';

describe('FeedbackComponent', () => {
  let component: FeedbackComponent;
  let httpMock: HttpTestingController;
  let feedbackService: FeedbackService;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackComponent, HttpClientTestingModule]
    }).compileComponents();

    const fixture = TestBed.createComponent(FeedbackComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    feedbackService = TestBed.inject(FeedbackService);
    authService = TestBed.inject(AuthService);
    component.recipeId = 1;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('should keep a local review when the server rejects the submission', () => {
    component.recipeId = 2;
    component.recipeName = 'Bolo';
    component.reviewForm.setValue({ rating: 5, comment: 'Bom' });

    component.submitRating();

    const req = httpMock.expectOne('/api/recipes/2/ratings');
    req.flush('fail', { status: 500, statusText: 'Server Error' });

    expect(component.message).toBe('Não foi possível enviar ao servidor — review salva localmente.');
  });

  it('should load system reviews on init when no recipeId is present', () => {
    component.recipeId = undefined;
    vi.spyOn(feedbackService, 'getReviews').mockReturnValue(of([
      { id: 1, rating: 5, comment: 'Muito bom' }
    ]));

    component.ngOnInit();

    expect(component.systemReviews).toEqual([{ id: 1, rating: 5, comment: 'Muito bom' }]);
  });

  it('should report system review load errors', () => {
    component.recipeId = undefined;
    vi.spyOn(feedbackService, 'getReviews').mockReturnValue(throwError(() => new Error('fail')));

    component.loadSystemReviews();

    expect(component.systemError).toBe('Nao foi possivel carregar os reviews.');
  });

  it('should submit system reviews in create and edit modes', () => {
    component.recipeId = undefined;
    component.reviewForm.setValue({ rating: 5, comment: 'Muito bom' });
    vi.spyOn(feedbackService, 'createReview').mockReturnValue(of({ id: 2, rating: 5, comment: 'Muito bom' }));

    component.submitSystemReview();

    expect(component.systemMessage).toBe('Review enviado com sucesso.');
    expect(component.systemReviews[0].id).toBe(2);

    component.reviewForm.setValue({ rating: 4, comment: 'Atualizado' });
    component.editingSystemReviewId = 2;
    vi.spyOn(feedbackService, 'updateReview').mockReturnValue(of({ id: 2, rating: 4, comment: 'Atualizado' }));

    component.submitSystemReview();

    expect(component.systemMessage).toBe('Review atualizado com sucesso.');
    expect(component.editingSystemReviewId).toBeNull();
  });

  it('should reject invalid system reviews and handle save errors', () => {
    component.reviewForm.setValue({ rating: 0, comment: '' });

    component.submitSystemReview();

    expect(component.systemError).toBe('Preencha nota e comentario.');

    component.reviewForm.setValue({ rating: 5, comment: 'Bom' });
    vi.spyOn(feedbackService, 'createReview').mockReturnValue(throwError(() => new Error('boom')));

    component.submitSystemReview();

    expect(component.systemError).toBe('Nao foi possivel salvar o review.');
  });

  it('should check ownership, edit, cancel and delete system reviews', () => {
    vi.spyOn(authService, 'getUsername').mockReturnValue('usuario1');

    expect(component.isOwnSystemReview({ user: { username: 'usuario1' } })).toBe(true);
    expect(component.isOwnSystemReview({ user: { username: 'outro' } })).toBe(false);

    component.editSystemReview({ id: 3, rating: 2, comment: 'Ruim' });
    expect(component.editingSystemReviewId).toBe(3);
    expect(component.reviewForm.value.comment).toBe('Ruim');

    component.cancelSystemEdit();
    expect(component.editingSystemReviewId).toBeNull();

    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    vi.spyOn(feedbackService, 'deleteReview').mockReturnValue(of(void 0));

    component.systemReviews = [{ id: 3, rating: 2, comment: 'Ruim' }];
    component.deleteSystemReview({ id: 3 });

    expect(confirmSpy).toHaveBeenCalled();
    expect(component.systemReviews).toEqual([]);
    expect(component.systemMessage).toBe('Review removido com sucesso.');
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FeedbackService } from './feedback.service';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let httpMock: HttpTestingController;
  const apiBase = '/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FeedbackService]
    });

    service = TestBed.inject(FeedbackService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should get reviews with GET request', () => {
    service.getReviews().subscribe(result => {
      expect(result).toEqual([{ id: 1 }]);
    });

    const req = httpMock.expectOne(`${apiBase}/system-reviews`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1 }]);
  });

  it('should create a review with POST request', () => {
    const payload = { rating: 5, comment: 'Bom' };
    service.createReview(payload).subscribe(result => expect(result).toEqual({ id: 2, ...payload }));

    const req = httpMock.expectOne(`${apiBase}/system-reviews`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 2, ...payload });
  });

  it('should update a review with PUT request', () => {
    const payload = { rating: 4, comment: 'Ok' };
    service.updateReview(2, payload).subscribe(result => expect(result).toEqual({ id: 2, ...payload }));

    const req = httpMock.expectOne(`${apiBase}/system-reviews/2`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 2, ...payload });
  });

  it('should delete a review with DELETE request', () => {
    service.deleteReview(2).subscribe(result => expect(result).toBeNull());

    const req = httpMock.expectOne(`${apiBase}/system-reviews/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});

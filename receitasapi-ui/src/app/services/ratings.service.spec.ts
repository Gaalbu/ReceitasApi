import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RatingsService } from './ratings.service';
import { LocalStoreService } from './local-store.service';

describe('RatingsService', () => {
  let service: RatingsService;
  let httpMock: HttpTestingController;
  let localSpy: any;

  beforeEach(() => {
    localSpy = jasmine.createSpyObj('LocalStoreService', ['isDemoMode', 'get', 'set', 'generateId']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        RatingsService,
        { provide: LocalStoreService, useValue: localSpy }
      ]
    });

    service = TestBed.inject(RatingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return local ratings when demo mode is enabled', (done) => {
    localSpy.isDemoMode.and.returnValue(true);
    localSpy.get.and.returnValue([{ id: 1, rating: 5 }]);

    service.myRatings().subscribe(result => {
      expect(result).toEqual([{ id: 1, rating: 5 }]);
      done();
    });
  });

  it('should call backend when not in demo mode and return data', (done) => {
    localSpy.isDemoMode.and.returnValue(false);

    service.myRatings().subscribe(result => {
      expect(result).toEqual([{ id: 2, rating: 4 }]);
      done();
    });

    const req = httpMock.expectOne(req => req.url.includes('/recipes/ratings/me'));
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 2, rating: 4 }]);
  });

  it('should fallback to local storage when backend fails', (done) => {
    localSpy.isDemoMode.and.returnValue(false);
    localSpy.get.and.returnValue([{ id: 9, rating: 3 }]);

    service.myRatings().subscribe(result => {
      expect(result).toEqual([{ id: 9, rating: 3 }]);
      done();
    });

    const req = httpMock.expectOne(req => req.url.includes('/recipes/ratings/me'));
    req.flush('error', { status: 500, statusText: 'Server Error' });
  });

  it('should add rating in demo mode and persist locally', (done) => {
    localSpy.isDemoMode.and.returnValue(true);
    localSpy.get.and.returnValue([]);
    localSpy.generateId.and.returnValue(123);

    service.addRating(5, { score: 5, comment: 'Nice' }).subscribe(entry => {
      expect(entry.recipeId).toBe(5);
      expect(entry.id).toBe(123);
      expect(localSpy.set).toHaveBeenCalled();
      done();
    });
  });

  it('should post rating to backend when not demo mode', (done) => {
    localSpy.isDemoMode.and.returnValue(false);

    service.addRating(7, { score: 4 }).subscribe(result => {
      expect(result).toEqual({ ok: true });
      done();
    });

    const req = httpMock.expectOne(req => req.url.includes('/recipes/7/ratings'));
    expect(req.request.method).toBe('POST');
    req.flush({ ok: true });
  });

  it('should fallback to local when post fails', (done) => {
    localSpy.isDemoMode.and.returnValue(false);
    localSpy.get.and.returnValue([]);
    localSpy.generateId.and.returnValue(555);

    service.addRating(8, { score: 2 }).subscribe(entry => {
      expect(entry.recipeId).toBe(8);
      expect(entry.id).toBe(555);
      expect(localSpy.set).toHaveBeenCalled();
      done();
    });

    const req = httpMock.expectOne(req => req.url.includes('/recipes/8/ratings'));
    req.flush('fail', { status: 500, statusText: 'Err' });
  });
});

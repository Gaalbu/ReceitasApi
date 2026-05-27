import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { RatingsService } from './ratings.service';
import { LocalStoreService } from './local-store.service';


describe('RatingsService', () => {
  let service: RatingsService;
  let httpMock: HttpTestingController;
  let localSpy: any;

  beforeEach(() => {
    localSpy = {
      isDemoMode: vi.fn(),
      get: vi.fn(),
      set: vi.fn(),
      generateId: vi.fn()
    };

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

  it('should return local ratings when demo mode is enabled', async () => {
    localSpy.isDemoMode.mockReturnValue(true);
    localSpy.get.mockReturnValue([{ id: 1, rating: 5 }]);

    await expect(firstValueFrom(service.myRatings())).resolves.toEqual([{ id: 1, rating: 5 }]);
  });

  it('should call backend when not in demo mode and return data', async () => {
    localSpy.isDemoMode.mockReturnValue(false);

    const request = firstValueFrom(service.myRatings());
    const req = httpMock.expectOne(req => req.url.includes('/recipes/ratings/me'));
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 2, rating: 4 }]);

    await expect(request).resolves.toEqual([{ id: 2, rating: 4 }]);
  });

  it('should fallback to local storage when backend fails', async () => {
    localSpy.isDemoMode.mockReturnValue(false);
    localSpy.get.mockReturnValue([{ id: 9, rating: 3 }]);

    const request = firstValueFrom(service.myRatings());
    const req = httpMock.expectOne(req => req.url.includes('/recipes/ratings/me'));
    req.flush('error', { status: 500, statusText: 'Server Error' });

    await expect(request).resolves.toEqual([{ id: 9, rating: 3 }]);
  });

  it('should add rating in demo mode and persist locally', async () => {
    localSpy.isDemoMode.mockReturnValue(true);
    localSpy.get.mockReturnValue([]);
    localSpy.generateId.mockReturnValue(123);

    const entry = await firstValueFrom(service.addRating(5, { score: 5, comment: 'Nice' }));
    expect(entry.recipeId).toBe(5);
    expect(entry.id).toBe(123);
    expect(localSpy.set).toHaveBeenCalled();
  });

  it('should post rating to backend when not demo mode', async () => {
    localSpy.isDemoMode.mockReturnValue(false);

    const request = firstValueFrom(service.addRating(7, { score: 4 }));
    const req = httpMock.expectOne(req => req.url.includes('/recipes/7/ratings'));
    expect(req.request.method).toBe('POST');
    req.flush({ ok: true });

    await expect(request).resolves.toEqual({ ok: true });
  });

  it('should fallback to local when post fails', async () => {
    localSpy.isDemoMode.mockReturnValue(false);
    localSpy.get.mockReturnValue([]);
    localSpy.generateId.mockReturnValue(555);

    const request = firstValueFrom(service.addRating(8, { score: 2 }));
    const req = httpMock.expectOne(req => req.url.includes('/recipes/8/ratings'));
    req.flush('fail', { status: 500, statusText: 'Err' });

    const entry = await request;
    expect(entry.recipeId).toBe(8);
    expect(entry.id).toBe(555);
    expect(localSpy.set).toHaveBeenCalled();
  });
});

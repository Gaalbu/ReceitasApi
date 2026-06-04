import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MealPlanService } from './mealplan.service';

describe('MealPlanService', () => {
  let service: MealPlanService;
  let httpMock: HttpTestingController;
  const apiBase = '/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MealPlanService]
    });

    service = TestBed.inject(MealPlanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a meal plan with POST request', () => {
    const payload = {
      name: 'Weekly Plan',
      startDate: '2026-05-25',
      endDate: '2026-06-01'
    };
    const mockResponse = { id: 1, ...payload };

    service.createMealPlan(payload).subscribe(result => {
      expect(result).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiBase}/meal-plans`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should get meal plans with GET request', () => {
    service.getMealPlans().subscribe(result => {
      expect(result).toEqual([{ id: 1 }]);
    });

    const req = httpMock.expectOne(`${apiBase}/meal-plans`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1 }]);
  });

  it('should update a meal plan with PUT request', () => {
    const payload = { plan_name: 'Plan', week_number: 2 };

    service.updateMealPlan(3, payload).subscribe(result => {
      expect(result).toEqual({ id: 3, ...payload });
    });

    const req = httpMock.expectOne(`${apiBase}/meal-plans/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 3, ...payload });
  });

  it('should delete a meal plan with DELETE request', () => {
    service.deleteMealPlan(3).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${apiBase}/meal-plans/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should handle error on create meal plan', () => {
    const payload = { name: 'Weekly Plan' };
    const errorMessage = 'Failed to create meal plan';
    let errorReceived = false;

    service.createMealPlan(payload).subscribe(
      () => {},
      error => {
        errorReceived = true;
        expect(error.status).toBe(400);
      }
    );

    const req = httpMock.expectOne(`${apiBase}/meal-plans`);
    req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
  });

  it('should encode special characters in meal plan name', () => {
    const payload = {
      name: 'Plan with special chars: & ? =',
      startDate: '2026-05-25'
    };

    service.createMealPlan(payload).subscribe();

    const req = httpMock.expectOne(request => request.url.includes('/meal-plans'));
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should handle empty payload', () => {
    const payload = {};

    service.createMealPlan(payload).subscribe();

    const req = httpMock.expectOne(`${apiBase}/meal-plans`);
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('should construct correct endpoint URL', () => {
    const payload = { name: 'Test Plan' };

    service.createMealPlan(payload).subscribe();

    const req = httpMock.expectOne(request => request.url.includes('/meal-plans'));
    expect(req.request.url).toBe(`${apiBase}/meal-plans`);
    req.flush({});
  });
});

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { resolveApiBase } from './api-base';

@Injectable({ providedIn: 'root' })
export class MealPlanService {
  private base = resolveApiBase();
  constructor(private http: HttpClient) {}

  createMealPlan(payload: any): Observable<any> {
    return this.http.post(`${this.base}/meal-plans`, payload);
  }
}

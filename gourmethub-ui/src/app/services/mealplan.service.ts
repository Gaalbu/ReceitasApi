import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MealPlanService {
  private base = '/api';
  constructor(private http: HttpClient) {}

  createMealPlan(payload: any): Observable<any> {
    return this.http.post(`${this.base}/meal-plans`, payload);
  }
}

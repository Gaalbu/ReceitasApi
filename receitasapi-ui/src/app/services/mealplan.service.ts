import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { resolveApiBase } from './api-base';

export interface MealPlanPayload {
  plan_name: string;
  start_date?: string;
  week_number?: number;
  items?: Array<{
    day_of_week: string;
    meal_type: string;
    recipe_id?: number;
    external_recipe_id?: string;
    external_recipe_name?: string;
  }>;
}

@Injectable({ providedIn: 'root' })
export class MealPlanService {
  constructor(private http: HttpClient) {}

  private endpoint(path: string): string {
    return `${resolveApiBase()}${path}`;
  }

  createMealPlan(payload: any): Observable<any> {
    return this.http.post(this.endpoint('/meal-plans'), payload);
  }

  getMealPlans(): Observable<any[]> {
    return this.http.get<any[]>(this.endpoint('/meal-plans'));
  }

  updateMealPlan(id: number, payload: MealPlanPayload): Observable<any> {
    return this.http.put<any>(this.endpoint(`/meal-plans/${id}`), payload);
  }

  deleteMealPlan(id: number): Observable<void> {
    return this.http.delete<void>(this.endpoint(`/meal-plans/${id}`));
  }
}

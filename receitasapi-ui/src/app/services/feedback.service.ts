import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { resolveApiBase } from './api-base';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  constructor(private http: HttpClient) {}

  private endpoint(path: string): string {
    return `${resolveApiBase()}${path}`;
  }

  getReviews(): Observable<any[]> {
    return this.http.get<any[]>(this.endpoint('/system-reviews'));
  }

  createReview(payload: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.endpoint('/system-reviews'), payload, { headers });
  }

  updateReview(id: number, payload: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<any>(this.endpoint(`/system-reviews/${id}`), payload, { headers });
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(this.endpoint(`/system-reviews/${id}`));
  }
}

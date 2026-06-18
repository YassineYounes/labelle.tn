import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Review {
  id: number;
  productId: number;
  author: string;
  rating: number;
  comment: string | null;
  verified: boolean;
  createdAt: string;
  mine?: boolean;
}

export interface ReviewSummary {
  count: number;
  average: number;
  distribution: { [star: string]: number };
  reviews: Review[];
}

export interface ReviewPayload {
  productId: number;
  rating: number;
  comment?: string;
}

/** Storefront product reviews (public read; authenticated submit via interceptor). */
@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  summary(productId: number): Observable<ReviewSummary> {
    return this.http.get<ReviewSummary>(`${this.base}/api/shop/products/${productId}/reviews`);
  }

  mine(productId: number): Observable<{ review: Review | null }> {
    return this.http.get<{ review: Review | null }>(`${this.base}/api/account/reviews/${productId}`);
  }

  submit(payload: ReviewPayload): Observable<Review> {
    return this.http.post<Review>(`${this.base}/api/account/reviews`, payload);
  }

  remove(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/account/reviews/${productId}`);
  }
}

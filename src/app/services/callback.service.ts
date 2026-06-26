import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CallbackPayload {
  name: string;
  phone: string;
  productId?: number;
  productName?: string;
  productSlug?: string;
  productUrl?: string;
}

/** "Be called back" requests left by shoppers on a product page. */
@Injectable({ providedIn: 'root' })
export class CallbackService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  request(payload: CallbackPayload): Observable<void> {
    return this.http.post<void>(`${this.base}/api/shop/callback-request`, payload);
  }
}

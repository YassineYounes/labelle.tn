import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DeliveryZone {
  id: number;
  name: string;
  fee: number;
}

export interface CheckoutItem {
  id: number;
  quantity: number;
}

export interface CheckoutPayload {
  customer: { firstName: string; lastName: string; phone: string; email?: string };
  shipping: { zoneId: number; city?: string; postalCode?: string; address: string };
  items: CheckoutItem[];
  comment?: string;
  couponCode?: string;
}

export interface QuoteRequest {
  items: CheckoutItem[];
  zoneId?: number | null;
  couponCode?: string;
}

export interface QuoteResult {
  subtotal: number;
  discount: number;
  couponCode: string | null;
  couponError: string | null;
  deliveryFee: number;
  total: number;
  zone: string | null;
}

export interface OrderConfirmation {
  reference: string;
  orderId: number;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  deliveryFee: number;
  total: number;
  status: string;
}

/** Storefront order placement against the public /api/shop checkout endpoints. */
@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  deliveryZones(): Observable<DeliveryZone[]> {
    return this.http.get<DeliveryZone[]>(`${this.base}/api/shop/delivery-zones`);
  }

  /** Server-side repricing — used to validate a promo code before checkout. */
  quote(payload: QuoteRequest): Observable<QuoteResult> {
    return this.http.post<QuoteResult>(`${this.base}/api/shop/checkout/quote`, payload);
  }

  placeOrder(payload: CheckoutPayload): Observable<OrderConfirmation> {
    return this.http.post<OrderConfirmation>(`${this.base}/api/shop/checkout`, payload);
  }
}

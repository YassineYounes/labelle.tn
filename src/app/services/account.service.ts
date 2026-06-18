import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CustomerProfile {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string | null;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
}

export interface OrderSummary {
  orderId: number;
  reference: string;
  createdAt: string;
  total: number;
  status: { name: string; color: string };
  itemCount: number;
}

export interface OrderDetail extends OrderSummary {
  shipping: { zone: string | null; city: string | null; address: string | null };
  lines: { name: string; unitPrice: number; quantity: number; lineTotal: number }[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  deliveryFee: number;
  paymentMethod: string;
  history: { status: string; color: string; at: string }[];
}

export const TOKEN_KEY = 'labelle-account-token';

/**
 * Storefront customer accounts. Holds the JWT (localStorage) and the current
 * profile as a signal; the token is attached to /api/account/* calls by the
 * auth interceptor.
 */
@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private base = environment.apiBase;

  private currentUser = signal<CustomerProfile | null>(null);
  user = this.currentUser.asReadonly();
  isLoggedIn = computed(() => this.currentUser() !== null);

  constructor() {
    // Restore the session on a browser reload if a token is present.
    if (this.isBrowser && this.token) {
      this.me().subscribe({ error: () => this.logout() });
    }
  }

  get token(): string | null {
    return this.isBrowser ? localStorage.getItem(TOKEN_KEY) : null;
  }

  private setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  register(payload: RegisterPayload): Observable<{ token: string; user: CustomerProfile }> {
    return this.http
      .post<{ token: string; user: CustomerProfile }>(`${this.base}/api/account/register`, payload)
      .pipe(
        tap((res) => {
          this.setToken(res.token);
          this.currentUser.set(res.user);
        }),
      );
  }

  login(email: string, password: string): Observable<CustomerProfile> {
    return new Observable<CustomerProfile>((subscriber) => {
      this.http
        .post<{ token: string }>(`${this.base}/api/account/login`, { email, password })
        .subscribe({
          next: (res) => {
            this.setToken(res.token);
            this.me().subscribe({
              next: (profile) => {
                subscriber.next(profile);
                subscriber.complete();
              },
              error: (err) => subscriber.error(err),
            });
          },
          error: (err) => subscriber.error(err),
        });
    });
  }

  me(): Observable<CustomerProfile> {
    return this.http
      .get<CustomerProfile>(`${this.base}/api/account/me`)
      .pipe(tap((profile) => this.currentUser.set(profile)));
  }

  updateProfile(payload: Partial<CustomerProfile>): Observable<CustomerProfile> {
    return this.http
      .put<CustomerProfile>(`${this.base}/api/account/me`, payload)
      .pipe(tap((profile) => this.currentUser.set(profile)));
  }

  orders(): Observable<OrderSummary[]> {
    return this.http.get<OrderSummary[]>(`${this.base}/api/account/orders`);
  }

  order(orderId: number): Observable<OrderDetail> {
    return this.http.get<OrderDetail>(`${this.base}/api/account/orders/${orderId}`);
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
    }
    this.currentUser.set(null);
  }
}

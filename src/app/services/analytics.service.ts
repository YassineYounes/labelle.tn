import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * Lightweight storefront analytics. Currently a single visit ping, sent once
 * per browser session, that feeds the back-office dashboard's daily-visits stat.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);

  trackVisit(): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    if (sessionStorage.getItem('lb_visit_sent')) {
      return;
    }

    let session = sessionStorage.getItem('lb_session');
    if (!session) {
      session = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('lb_session', session);
    }
    sessionStorage.setItem('lb_visit_sent', '1');

    this.http
      .post(`${environment.apiBase}/api/shop/track-visit`, { session })
      .subscribe({ next: () => {}, error: () => {} });
  }
}

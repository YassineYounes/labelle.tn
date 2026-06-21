import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';

interface ShopConfigDto {
  freeShippingThreshold: number;
  defaultDeliveryFee: number;
}

/**
 * Storefront delivery configuration, sourced from the back-office settings
 * (/api/shop/config): the free-delivery threshold and the default delivery fee.
 * Loaded once at startup and exposed as signals so any component/service reads
 * the same live values instead of hardcoding 300 / 8.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private http = inject(HttpClient);

  /** Subtotal (TND) at or above which delivery is free. */
  readonly freeShippingThreshold = signal(300);
  /** Default delivery fee (TND) shown before a zone is chosen. */
  readonly defaultDeliveryFee = signal(8);

  constructor() {
    this.load();
  }

  load(): void {
    this.http.get<ShopConfigDto>(`${environment.apiBase}/api/shop/config`).subscribe({
      next: (cfg) => {
        if (typeof cfg.freeShippingThreshold === 'number') {
          this.freeShippingThreshold.set(cfg.freeShippingThreshold);
        }
        if (typeof cfg.defaultDeliveryFee === 'number') {
          this.defaultDeliveryFee.set(cfg.defaultDeliveryFee);
        }
      },
      error: () => {
        // Keep the safe defaults on failure.
      },
    });
  }

  /** Formatted threshold for display, e.g. "200 DT" (no trailing decimals). */
  thresholdLabel(): string {
    return `${this.freeShippingThreshold()} DT`;
  }
}

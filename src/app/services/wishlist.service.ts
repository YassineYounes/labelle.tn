import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../data/site-data';
import { findProductById } from '../data/catalog';

const STORAGE_KEY = 'labelle-wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private ids = signal<number[]>(this.load());

  constructor() {
    effect(() => {
      const value = this.ids();
      if (this.isBrowser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      }
    });
  }

  count = computed(() => this.ids().length);

  products = computed<Product[]>(() =>
    this.ids()
      .map((id) => findProductById(id))
      .filter((p): p is Product => p !== undefined),
  );

  has(productId: number): boolean {
    return this.ids().includes(productId);
  }

  /** Reactive membership check for templates */
  contains = (productId: number) => computed(() => this.ids().includes(productId));

  toggle(productId: number): void {
    this.ids.update((ids) =>
      ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId],
    );
  }

  private load(): number[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }
}

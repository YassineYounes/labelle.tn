import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../data/site-data';

const STORAGE_KEY = 'labelle-wishlist';

/**
 * Wishlist state. Like the cart, it stores product snapshots so it no longer
 * depends on the catalog source to render.
 */
@Injectable({ providedIn: 'root' })
export class WishlistService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private items = signal<Product[]>(this.load());

  constructor() {
    effect(() => {
      const value = this.items();
      if (this.isBrowser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      }
    });
  }

  count = computed(() => this.items().length);

  products = computed<Product[]>(() => this.items());

  has(productId: number): boolean {
    return this.items().some((p) => p.id === productId);
  }

  /** Reactive membership check for templates */
  contains = (productId: number) => computed(() => this.items().some((p) => p.id === productId));

  toggle(product: Product): void {
    this.items.update((items) =>
      items.some((p) => p.id === product.id)
        ? items.filter((p) => p.id !== product.id)
        : [...items, product],
    );
  }

  private load(): Product[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      // Only accept the snapshot shape (array of product objects); ignore legacy id arrays.
      if (Array.isArray(parsed) && parsed.every((v) => v && typeof v === 'object' && 'id' in v)) {
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  }
}

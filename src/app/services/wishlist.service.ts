import { Injectable, PLATFORM_ID, computed, effect, inject, signal, untracked } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../data/site-data';
import { AccountService } from './account.service';
import { CatalogService } from './catalog.service';

const STORAGE_KEY = 'labelle-wishlist';

/**
 * Wishlist state. Stores product snapshots so it renders without the catalog.
 * For guests it lives in localStorage; once a customer logs in it syncs with
 * the server-side wishlist (the local items are merged in) so it follows them
 * across devices.
 */
@Injectable({ providedIn: 'root' })
export class WishlistService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private account = inject(AccountService);
  private catalog = inject(CatalogService);

  private items = signal<Product[]>(this.load());
  /** True once we've synced with the server for the current logged-in session. */
  private synced = false;

  constructor() {
    effect(() => {
      const value = this.items();
      if (this.isBrowser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      }
    });

    // Sync with the server-side wishlist on login; reset the flag on logout.
    effect(() => {
      const user = this.account.user();
      if (!this.isBrowser) {
        return;
      }
      if (user && !this.synced) {
        this.synced = true;
        this.syncOnLogin();
      } else if (!user) {
        this.synced = false;
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
    const present = this.items().some((p) => p.id === product.id);
    // Optimistic local update.
    this.items.update((items) =>
      present ? items.filter((p) => p.id !== product.id) : [...items, product],
    );

    if (this.account.isLoggedIn()) {
      if (present) {
        this.catalog.removeFromWishlist(product.id).subscribe({ error: () => {} });
      } else {
        this.catalog.addToWishlist(product.id).subscribe({
          next: (products) => this.items.set(products),
          error: () => {},
        });
      }
    }
  }

  private syncOnLogin(): void {
    const localIds = untracked(() => this.items()).map((p) => p.id);
    const request = localIds.length
      ? this.catalog.mergeWishlist(localIds)
      : this.catalog.wishlist();
    request.subscribe({
      next: (products) => this.items.set(products),
      error: () => {},
    });
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

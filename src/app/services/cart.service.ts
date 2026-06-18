import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../data/site-data';

export interface CartLine {
  product: Product;
  quantity: number;
}

const STORAGE_KEY = 'labelle-cart';
const FREE_DELIVERY_THRESHOLD = 300;
const DELIVERY_FEE = 8;

export function parsePrice(product: Product): number {
  return parseFloat(product.price.replace(',', '.'));
}

export function formatPrice(value: number): string {
  return value.toFixed(3).replace('.', ',') + ' TND';
}

/**
 * Cart state. Each line stores a snapshot of the product as it was when added,
 * so the cart no longer depends on the catalog source (static data or API) and
 * survives a product later being unpublished.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  /** productId -> { product snapshot, quantity } */
  private items = signal<Record<number, CartLine>>(this.load());

  constructor() {
    effect(() => {
      const value = this.items();
      if (this.isBrowser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      }
    });
  }

  lines = computed<CartLine[]>(() => Object.values(this.items()));

  count = computed(() => this.lines().reduce((sum, line) => sum + line.quantity, 0));

  subtotal = computed(() =>
    this.lines().reduce((sum, line) => sum + parsePrice(line.product) * line.quantity, 0),
  );

  deliveryFee = computed(() => {
    if (this.lines().length === 0 || this.subtotal() >= FREE_DELIVERY_THRESHOLD) {
      return 0;
    }
    return DELIVERY_FEE;
  });

  total = computed(() => this.subtotal() + this.deliveryFee());

  add(product: Product, quantity = 1): void {
    this.items.update((items) => {
      const existing = items[product.id];
      return {
        ...items,
        [product.id]: { product, quantity: (existing?.quantity ?? 0) + quantity },
      };
    });
  }

  setQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    this.items.update((items) => {
      const existing = items[productId];
      if (!existing) {
        return items;
      }
      return { ...items, [productId]: { ...existing, quantity } };
    });
  }

  remove(productId: number): void {
    this.items.update((items) => {
      const { [productId]: _, ...rest } = items;
      return rest;
    });
  }

  clear(): void {
    this.items.set({});
  }

  private load(): Record<number, CartLine> {
    if (typeof localStorage === 'undefined') {
      return {};
    }
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
      // Only accept the snapshot shape ({ product, quantity }); ignore legacy data.
      const valid = Object.values(parsed).every(
        (v): boolean => !!v && typeof v === 'object' && 'product' in (v as object),
      );
      return valid ? parsed : {};
    } catch {
      return {};
    }
  }
}

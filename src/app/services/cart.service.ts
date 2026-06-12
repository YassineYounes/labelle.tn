import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../data/site-data';
import { findProductById } from '../data/catalog';

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

@Injectable({ providedIn: 'root' })
export class CartService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  /** productId -> quantity */
  private quantities = signal<Record<number, number>>(this.load());

  constructor() {
    effect(() => {
      const value = this.quantities();
      if (this.isBrowser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      }
    });
  }

  lines = computed<CartLine[]>(() =>
    Object.entries(this.quantities())
      .map(([id, quantity]) => {
        const product = findProductById(Number(id));
        return product ? { product, quantity } : null;
      })
      .filter((line): line is CartLine => line !== null),
  );

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

  add(productId: number, quantity = 1): void {
    this.quantities.update((q) => ({ ...q, [productId]: (q[productId] ?? 0) + quantity }));
  }

  setQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    this.quantities.update((q) => ({ ...q, [productId]: quantity }));
  }

  remove(productId: number): void {
    this.quantities.update((q) => {
      const { [productId]: _, ...rest } = q;
      return rest;
    });
  }

  clear(): void {
    this.quantities.set({});
  }

  private load(): Record<number, number> {
    if (typeof localStorage === 'undefined') {
      return {};
    }
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    } catch {
      return {};
    }
  }
}

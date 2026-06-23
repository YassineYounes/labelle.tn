import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../data/site-data';
import { ConfigService } from './config.service';

export interface CartLine {
  product: Product;
  quantity: number;
}

const STORAGE_KEY = 'labelle-cart';

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
  private config = inject(ConfigService);

  /** productId -> { product snapshot, quantity } */
  private items = signal<Record<number, CartLine>>(this.load());

  /**
   * The item most recently added (quantity = the amount just added, not the
   * running total). Emitted as a fresh object on every add so a global
   * "added to cart" popup can react — even when the same product is re-added.
   */
  lastAdded = signal<CartLine | null>(null);

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
    if (this.lines().length === 0 || this.subtotal() >= this.config.freeShippingThreshold()) {
      return 0;
    }
    return this.config.defaultDeliveryFee();
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
    this.lastAdded.set({ product, quantity });
  }

  /** Quantity of a given product currently in the cart (0 if absent). */
  quantityOf(productId: number): number {
    return this.items()[productId]?.quantity ?? 0;
  }

  /**
   * Add a coffret to the cart as a single line. Bundles are represented as a
   * pseudo-product (offset id so it never clashes with a real product id) so the
   * existing cart UI works unchanged; checkout sends bundleId for these lines.
   */
  addBundle(bundle: {
    id: number;
    name: string;
    price: number;
    priceLabel: string;
    cover: string;
    slug: string;
    availableQuantity?: number;
  }): void {
    const stock = bundle.availableQuantity ?? 999;
    const pseudo: Product = {
      id: 9_000_000 + bundle.id,
      bundleId: bundle.id,
      isBundle: true,
      name: bundle.name,
      cardName: bundle.name,
      image: bundle.cover,
      largeImage: bundle.cover,
      link: '/coffret',
      price: bundle.priceLabel,
      inStock: stock > 0,
      reference: '',
      stock,
      shortDescription: [],
      description: [],
    };
    this.add(pseudo, 1);
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

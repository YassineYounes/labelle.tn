import { Injectable, signal } from '@angular/core';
import { Product } from '../data/site-data';

/**
 * Drives the global "Aperçu rapide" (quick view) modal. Any product card can
 * call open(product) to surface the product without leaving the listing.
 */
@Injectable({ providedIn: 'root' })
export class QuickViewService {
  /** The product currently shown in the quick-view modal, or null if closed. */
  readonly product = signal<Product | null>(null);

  open(product: Product): void {
    this.product.set(product);
  }

  close(): void {
    this.product.set(null);
  }
}

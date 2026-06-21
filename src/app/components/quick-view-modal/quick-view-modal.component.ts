import { Component, HostListener, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { QuickViewService } from '../../services/quick-view.service';

/**
 * Global "Aperçu rapide" modal: a compact product preview opened from any
 * product card, with image, price, short description and an add-to-cart that
 * honours stock — without leaving the current listing.
 */
@Component({
  selector: 'app-quick-view-modal',
  imports: [RouterLink],
  templateUrl: './quick-view-modal.component.html',
  styleUrl: './quick-view-modal.component.css',
})
export class QuickViewModalComponent {
  private quickView = inject(QuickViewService);
  private cart = inject(CartService);

  product = this.quickView.product;
  quantity = signal(1);
  stockError = signal<string | null>(null);

  constructor() {
    // Reset the stepper/error whenever a new product is opened.
    effect(() => {
      this.product();
      untracked(() => {
        this.quantity.set(1);
        this.stockError.set(null);
      });
    });
  }

  increment(): void {
    const p = this.product();
    if (!p) {
      return;
    }
    this.quantity.update((q) => Math.min(p.stock || 1, q + 1));
    this.stockError.set(null);
  }

  decrement(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
    this.stockError.set(null);
  }

  addToCart(): void {
    const p = this.product();
    if (!p || p.stock === 0) {
      return;
    }
    const inCart = this.cart.quantityOf(p.id);
    const requested = this.quantity();
    if (inCart + requested > p.stock) {
      const remaining = Math.max(0, p.stock - inCart);
      this.stockError.set(
        remaining === 0
          ? `Vous avez déjà la totalité du stock disponible (${p.stock}) dans votre panier.`
          : `Stock insuffisant : il ne reste que ${p.stock} en stock` +
              (inCart > 0 ? `, dont ${inCart} déjà dans votre panier.` : '.'),
      );
      return;
    }
    this.cart.add(p, requested);
    // Hand off to the "added to cart" popup.
    this.close();
  }

  @HostListener('document:keydown.escape')
  close(): void {
    this.quickView.close();
  }
}

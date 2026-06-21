import { Component, HostListener, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartLine, CartService, formatPrice } from '../../services/cart.service';

/**
 * Global "added to cart" confirmation popup. It reacts to CartService.lastAdded
 * so it fires from anywhere a product is added (cards, product page) and offers
 * the shopper a clear next step: keep shopping or head to the cart / checkout.
 */
@Component({
  selector: 'app-cart-added-modal',
  imports: [RouterLink],
  templateUrl: './cart-added-modal.component.html',
  styleUrl: './cart-added-modal.component.css',
})
export class CartAddedModalComponent {
  cart = inject(CartService);

  open = signal(false);
  line = signal<CartLine | null>(null);

  formatPrice = formatPrice;

  constructor() {
    effect(() => {
      const added = this.cart.lastAdded();
      if (added) {
        untracked(() => {
          this.line.set(added);
          this.open.set(true);
        });
      }
    });
  }

  @HostListener('document:keydown.escape')
  close(): void {
    this.open.set(false);
  }
}

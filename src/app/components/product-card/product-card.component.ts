import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../data/site-data';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { QuickViewService } from '../../services/quick-view.service';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  product = input.required<Product>();
  /** Show the review-stars row (hidden in the home-page sliders). */
  showRating = input(true);

  cart = inject(CartService);
  wishlist = inject(WishlistService);
  quickView = inject(QuickViewService);

  addToCart(): void {
    const p = this.product();
    // Don't allow the quick-add to push the cart past available stock.
    if (p.inStock && this.cart.quantityOf(p.id) < p.stock) {
      this.cart.add(p);
    }
  }

  toggleWishlist(): void {
    this.wishlist.toggle(this.product());
  }
}

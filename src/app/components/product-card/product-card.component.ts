import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../data/site-data';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  product = input.required<Product>();

  cart = inject(CartService);
  wishlist = inject(WishlistService);

  addToCart(): void {
    if (this.product().inStock) {
      this.cart.add(this.product());
    }
  }

  toggleWishlist(): void {
    this.wishlist.toggle(this.product());
  }
}

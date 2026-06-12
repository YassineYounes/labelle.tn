import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Product } from '../../data/site-data';
import { ALL_PRODUCTS } from '../../data/catalog';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';

type Tab = 'description' | 'details' | 'comments';

@Component({
  selector: 'app-product',
  imports: [RouterLink],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private slug = toSignal(this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')), {
    initialValue: '',
  });

  product = computed<Product>(() => {
    const id = parseInt(this.slug(), 10);
    const found = ALL_PRODUCTS.find((p) => p.id === id);
    if (!found) {
      this.router.navigate(['/']);
      return ALL_PRODUCTS[0];
    }
    return found;
  });

  nextProduct = computed<Product>(() => {
    const idx = ALL_PRODUCTS.indexOf(this.product());
    return ALL_PRODUCTS[(idx + 1) % ALL_PRODUCTS.length];
  });

  cart = inject(CartService);
  wishlist = inject(WishlistService);

  quantity = signal(1);
  activeTab = signal<Tab>('description');
  addedToCart = signal(false);

  addToCart(): void {
    if (this.product().stock === 0) {
      return;
    }
    this.cart.add(this.product().id, this.quantity());
    this.addedToCart.set(true);
    setTimeout(() => this.addedToCart.set(false), 2500);
  }

  toggleWishlist(): void {
    this.wishlist.toggle(this.product().id);
  }

  /** Width of the "Dépêchez-vous!" stock bar (the original counts against a max of 20) */
  stockPercent = computed(() => Math.min(100, (this.product().stock / 20) * 100));

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  increment(): void {
    this.quantity.update((q) => q + 1);
  }

  decrement(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
  }
}

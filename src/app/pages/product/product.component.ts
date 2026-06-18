import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { Product } from '../../data/site-data';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { CatalogService } from '../../services/catalog.service';

type Tab = 'description' | 'details' | 'comments';

const EMPTY_PRODUCT: Product = {
  id: 0,
  name: '',
  cardName: '',
  image: '',
  largeImage: '',
  link: '/',
  price: '',
  inStock: false,
  reference: '',
  stock: 0,
  shortDescription: [],
  description: [],
};

@Component({
  selector: 'app-product',
  imports: [RouterLink],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalog = inject(CatalogService);

  private slug = toSignal(this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')), {
    initialValue: '',
  });

  private data = toSignal(
    toObservable(this.slug).pipe(
      switchMap((slug) =>
        slug
          ? this.catalog.product(slug).pipe(
              catchError(() => {
                this.router.navigate(['/']);
                return of(null);
              }),
            )
          : of(null),
      ),
    ),
    { initialValue: null },
  );

  loaded = computed(() => this.data() !== null);
  product = computed<Product>(() => this.data() ?? EMPTY_PRODUCT);

  /** "Next product" / related, pulled from featured (we no longer hold the full list). */
  private related = toSignal(this.catalog.featured(8), { initialValue: [] as Product[] });
  nextProduct = computed<Product>(() => {
    const others = this.related().filter((p) => p.id !== this.product().id);
    return others[0] ?? this.product();
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
    this.cart.add(this.product(), this.quantity());
    this.addedToCart.set(true);
    setTimeout(() => this.addedToCart.set(false), 2500);
  }

  toggleWishlist(): void {
    this.wishlist.toggle(this.product());
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

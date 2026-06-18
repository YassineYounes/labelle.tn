import { Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { Product } from '../../data/site-data';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { CatalogService } from '../../services/catalog.service';
import { AccountService } from '../../services/account.service';
import { Review, ReviewService, ReviewSummary } from '../../services/review.service';

type Tab = 'description' | 'details' | 'comments';

const EMPTY_SUMMARY: ReviewSummary = {
  count: 0,
  average: 0,
  distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
  reviews: [],
};

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
  imports: [RouterLink, FormsModule, DatePipe],
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
  account = inject(AccountService);
  private reviewApi = inject(ReviewService);

  quantity = signal(1);
  activeTab = signal<Tab>('description');
  addedToCart = signal(false);

  // ----- Reviews -----
  reviewData = signal<ReviewSummary>(EMPTY_SUMMARY);
  myReview = signal<Review | null>(null);
  formRating = signal(0);
  formComment = '';
  submittingReview = signal(false);
  reviewError = signal<string | null>(null);
  reviewSaved = signal(false);

  reviewCount = computed(() => this.reviewData().count);
  averageRating = computed(() => this.reviewData().average);
  /** 1..5 — whether each star is filled for the average display. */
  averageStars = computed(() => {
    const avg = Math.round(this.averageRating());
    return [1, 2, 3, 4, 5].map((s) => s <= avg);
  });

  constructor() {
    // (Re)load reviews whenever the product changes.
    effect(() => {
      const id = this.product().id;
      if (id > 0) {
        this.loadReviews(id);
      }
    });
  }

  private loadReviews(productId: number): void {
    this.reviewApi
      .summary(productId)
      .pipe(catchError(() => of(EMPTY_SUMMARY)))
      .subscribe((summary) => this.reviewData.set(summary));

    if (this.account.isLoggedIn()) {
      this.reviewApi
        .mine(productId)
        .pipe(catchError(() => of({ review: null })))
        .subscribe((res) => {
          this.myReview.set(res.review);
          if (res.review) {
            this.formRating.set(res.review.rating);
            this.formComment = res.review.comment ?? '';
          }
        });
    }
  }

  setRating(star: number): void {
    this.formRating.set(star);
    this.reviewError.set(null);
  }

  submitReview(): void {
    const productId = this.product().id;
    if (this.formRating() < 1) {
      this.reviewError.set('Veuillez choisir une note.');
      return;
    }
    this.submittingReview.set(true);
    this.reviewError.set(null);
    this.reviewApi
      .submit({
        productId,
        rating: this.formRating(),
        comment: this.formComment.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.submittingReview.set(false);
          this.reviewSaved.set(true);
          this.loadReviews(productId);
          setTimeout(() => this.reviewSaved.set(false), 3000);
        },
        error: (err) => {
          this.submittingReview.set(false);
          this.reviewError.set(err?.error?.error ?? 'Une erreur est survenue.');
        },
      });
  }

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

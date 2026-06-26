import { Component, ElementRef, HostListener, ViewChild, computed, effect, inject, signal, untracked } from '@angular/core';
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
import { CallbackService } from '../../services/callback.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

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
  imports: [RouterLink, FormsModule, DatePipe, ProductCardComponent],
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
  private related = toSignal(this.catalog.featured(12), { initialValue: [] as Product[] });
  nextProduct = computed<Product>(() => {
    const others = this.related().filter((p) => p.id !== this.product().id);
    return others[0] ?? this.product();
  });
  prevProduct = computed<Product>(() => {
    const others = this.related().filter((p) => p.id !== this.product().id);
    // Pick a different neighbour from "next" so the two arrows don't collide.
    return others[others.length - 1] ?? this.product();
  });

  /** Suggested products for the slider (related minus the current product). */
  suggestions = computed<Product[]>(() =>
    this.related().filter((p) => p.id !== this.product().id),
  );

  cart = inject(CartService);
  wishlist = inject(WishlistService);
  account = inject(AccountService);
  private reviewApi = inject(ReviewService);
  private callbackApi = inject(CallbackService);

  quantity = signal(1);
  activeTab = signal<Tab>('description');
  stockError = signal<string | null>(null);

  /** The gallery image shown in the main cover; defaults to the cover. */
  gallery = computed<string[]>(() => this.product().images ?? [this.product().largeImage]);
  selectedImage = signal<string | null>(null);
  /** Cover currently displayed — the user's pick, or the gallery's first. */
  activeImage = computed<string>(() => this.selectedImage() ?? this.gallery()[0]);

  selectImage(src: string): void {
    this.selectedImage.set(src);
  }

  // ----- Image lightbox -----
  lightboxOpen = signal(false);
  lightboxIndex = signal(0);

  openLightbox(): void {
    const idx = this.gallery().indexOf(this.activeImage());
    this.lightboxIndex.set(idx >= 0 ? idx : 0);
    this.lightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  lightboxNext(): void {
    const len = this.gallery().length;
    this.lightboxIndex.update((i) => (i + 1) % len);
  }

  lightboxPrev(): void {
    const len = this.gallery().length;
    this.lightboxIndex.update((i) => (i - 1 + len) % len);
  }

  @HostListener('document:keydown', ['$event'])
  onLightboxKey(e: KeyboardEvent): void {
    if (!this.lightboxOpen()) {
      return;
    }
    if (e.key === 'Escape') {
      this.closeLightbox();
    } else if (e.key === 'ArrowRight') {
      this.lightboxNext();
    } else if (e.key === 'ArrowLeft') {
      this.lightboxPrev();
    }
  }

  @ViewChild('reviewsSection') private reviewsSection?: ElementRef<HTMLElement>;
  @ViewChild('suggestTrack') private suggestTrack?: ElementRef<HTMLElement>;

  // ----- Reviews -----
  reviewData = signal<ReviewSummary>(EMPTY_SUMMARY);
  myReview = signal<Review | null>(null);
  formRating = signal(0);
  formComment = '';
  submittingReview = signal(false);
  reviewError = signal<string | null>(null);
  reviewSaved = signal(false);

  // ----- "Be called back" -----
  callbackOpen = signal(false);
  callbackName = '';
  callbackPhone = '';
  submittingCallback = signal(false);
  callbackError = signal<string | null>(null);
  callbackSaved = signal(false);

  reviewCount = computed(() => this.reviewData().count);
  averageRating = computed(() => this.reviewData().average);
  /** 1..5 — whether each star is filled for the average display. */
  averageStars = computed(() => {
    const avg = Math.round(this.averageRating());
    return [1, 2, 3, 4, 5].map((s) => s <= avg);
  });

  constructor() {
    // (Re)load reviews and reset the gallery selection whenever the product changes.
    effect(() => {
      const id = this.product().id;
      untracked(() => {
        this.selectedImage.set(null);
        this.lightboxOpen.set(false);
      });
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

  openCallback(): void {
    // Prefill from the logged-in customer when we can.
    const user = this.account.user();
    if (user) {
      this.callbackName = this.callbackName || `${user.firstName} ${user.lastName}`.trim();
      this.callbackPhone = this.callbackPhone || user.phone || '';
    }
    this.callbackError.set(null);
    this.callbackSaved.set(false);
    this.callbackOpen.set(true);
  }

  closeCallback(): void {
    this.callbackOpen.set(false);
  }

  submitCallback(): void {
    const name = this.callbackName.trim();
    const phone = this.callbackPhone.trim();
    if (!name || !phone) {
      this.callbackError.set('Veuillez indiquer votre nom et votre téléphone.');
      return;
    }
    if ((phone.match(/\d/g) ?? []).length < 8) {
      this.callbackError.set('Numéro de téléphone invalide.');
      return;
    }

    const p = this.product();
    this.submittingCallback.set(true);
    this.callbackError.set(null);
    this.callbackApi
      .request({
        name,
        phone,
        productId: p.id || undefined,
        productName: p.name,
        productSlug: this.slug() || undefined,
        productUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      })
      .subscribe({
        next: () => {
          this.submittingCallback.set(false);
          this.callbackSaved.set(true);
          this.callbackName = '';
          this.callbackPhone = '';
          setTimeout(() => this.callbackOpen.set(false), 2500);
        },
        error: (err) => {
          this.submittingCallback.set(false);
          this.callbackError.set(err?.error?.error ?? 'Une erreur est survenue. Réessayez.');
        },
      });
  }

  addToCart(): void {
    const p = this.product();
    if (p.stock === 0) {
      return;
    }
    const inCart = this.cart.quantityOf(p.id);
    const requested = this.quantity();

    // Validate against available stock up front, so the shopper finds out here
    // instead of at the last checkout step.
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

    this.stockError.set(null);
    this.cart.add(p, requested);
  }

  toggleWishlist(): void {
    this.wishlist.toggle(this.product());
  }

  /** Width of the "Dépêchez-vous!" stock bar (the original counts against a max of 20) */
  stockPercent = computed(() => Math.min(100, (this.product().stock / 20) * 100));

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  /** Slide the suggestions track left (-1) or right (1). */
  scrollSuggest(dir: -1 | 1): void {
    const el = this.suggestTrack?.nativeElement;
    if (el) {
      el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
    }
  }

  /** Open the comments tab and smooth-scroll to the reviews / question area. */
  goToReviews(): void {
    this.activeTab.set('comments');
    // Wait for the comments pane to render before scrolling to it.
    setTimeout(() => {
      this.reviewsSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  increment(): void {
    // Don't let the stepper climb past what's in stock.
    this.quantity.update((q) => Math.min(this.product().stock || 1, q + 1));
    this.stockError.set(null);
  }

  decrement(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
    this.stockError.set(null);
  }
}

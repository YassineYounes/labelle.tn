import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { Bundle, CatalogService } from '../../services/catalog.service';
import { CartService } from '../../services/cart.service';

/**
 * A single coffret (bundle) page: photo gallery, price, description, what's
 * inside, and add-to-cart. Reached from the coffret category grid.
 */
@Component({
  selector: 'app-coffret',
  imports: [RouterLink],
  templateUrl: './coffret.component.html',
  styleUrl: './coffret.component.css',
})
export class CoffretComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalog = inject(CatalogService);
  private cart = inject(CartService);

  private slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')), {
    initialValue: '',
  });

  private data = toSignal(
    toObservable(this.slug).pipe(
      switchMap((slug) =>
        slug
          ? this.catalog.bundle(slug).pipe(
              catchError(() => {
                this.router.navigate(['/coffret']);
                return of(null);
              }),
            )
          : of(null),
      ),
    ),
    { initialValue: null as Bundle | null },
  );

  loaded = computed(() => this.data() !== null);
  bundle = computed(() => this.data());
  gallery = computed<string[]>(() => {
    const b = this.data();
    return b && b.photos.length ? b.photos : b ? [b.cover] : [];
  });
  selected = signal<string | null>(null);
  activeImage = computed(() => this.selected() ?? this.gallery()[0] ?? '');

  added = signal(false);

  select(src: string): void {
    this.selected.set(src);
  }

  addToCart(): void {
    const b = this.data();
    if (!b) {
      return;
    }
    this.cart.addBundle(b);
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2500);
  }
}

import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { BrandPage, CatalogService } from '../../services/catalog.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-brand',
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css',
})
export class BrandComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalog = inject(CatalogService);

  private slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')), {
    initialValue: '',
  });

  private data = toSignal(
    toObservable(this.slug).pipe(
      switchMap((slug) =>
        slug
          ? this.catalog.brand(slug).pipe(
              catchError(() => {
                this.router.navigate(['/']);
                return of(null);
              }),
            )
          : of(null),
      ),
    ),
    { initialValue: null as BrandPage | null },
  );

  loaded = computed(() => this.data() !== null);
  brand = computed(() => this.data()?.brand ?? null);
  products = computed(() => this.data()?.products ?? []);
  total = computed(() => this.data()?.total ?? 0);

  initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0))
      .join('')
      .toUpperCase();
  }
}

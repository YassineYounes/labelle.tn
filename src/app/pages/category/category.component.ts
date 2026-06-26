import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, map, of, switchMap } from 'rxjs';
import { Product } from '../../data/site-data';
import { Bundle, CategoryFacets, CategoryPage, CatalogService } from '../../services/catalog.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { CartService } from '../../services/cart.service';

const PAGE_SIZE = 12;

interface SortOption {
  key: string;
  label: string;
}

/** Storefront sort keys mapped to the API's supported sort params. */
const SORT_OPTIONS: SortOption[] = [
  { key: 'product.sales.desc', label: 'Ventes, ordre décroissant' },
  { key: 'product.position.asc', label: 'Pertinence' },
  { key: 'product.name.asc', label: 'Nom, A à Z' },
  { key: 'product.price.asc', label: 'Prix, croissant' },
  { key: 'product.price.desc', label: 'Prix, décroissant' },
];

const API_SORT: Record<string, string> = {
  'product.name.asc': 'name',
  'product.price.asc': 'price_asc',
  'product.price.desc': 'price_desc',
  'product.sales.desc': 'newest',
  'product.position.asc': 'newest',
};

interface BreadcrumbItem {
  id: string;
  name: string;
  link: string;
}

interface CategoryView {
  name: string;
  children: { name: string; link: string }[];
}

@Component({
  selector: 'app-category',
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalog = inject(CatalogService);
  private cart = inject(CartService);

  sortOptions = SORT_OPTIONS;
  sortOpen = signal(false);
  gridColumns = signal(3);

  private catSlug = toSignal(this.route.paramMap.pipe(map((params) => params.get('catSlug') ?? '')), {
    initialValue: '',
  });

  private queryParams = toSignal(this.route.queryParamMap, { initialValue: null });

  page = computed(() => {
    const raw = this.queryParams()?.get('page');
    const page = raw ? parseInt(raw, 10) : 1;
    return isNaN(page) || page < 1 ? 1 : page;
  });

  sortKey = computed(() => this.queryParams()?.get('order') ?? 'product.position.asc');

  sortLabel = computed(
    () => SORT_OPTIONS.find((o) => o.key === this.sortKey())?.label ?? 'Pertinence',
  );

  // ----- Filters (kept in the URL so they survive sort/pagination) -----
  selectedBrands = computed<string[]>(() => {
    const raw = this.queryParams()?.get('brands') ?? '';
    return raw ? raw.split(',').filter(Boolean) : [];
  });
  minPrice = computed(() => this.queryParams()?.get('min') ?? '');
  maxPrice = computed(() => this.queryParams()?.get('max') ?? '');
  inStock = computed(() => this.queryParams()?.get('stock') === '1');
  hasActiveFilters = computed(
    () => this.selectedBrands().length > 0 || !!this.minPrice() || !!this.maxPrice() || this.inStock(),
  );

  private filterKey = computed(() =>
    JSON.stringify([this.selectedBrands(), this.minPrice(), this.maxPrice(), this.inStock()]),
  );

  private data = toSignal(
    combineLatest([
      toObservable(this.catSlug),
      toObservable(this.page),
      toObservable(this.sortKey),
      toObservable(this.filterKey),
    ]).pipe(
      switchMap(([slug, page, key]) =>
        slug
          ? this.catalog
              .category(slug, page, API_SORT[key] ?? 'newest', {
                brands: this.selectedBrands(),
                minPrice: this.minPrice(),
                maxPrice: this.maxPrice(),
                inStock: this.inStock(),
              })
              .pipe(
                catchError(() => {
                  this.router.navigate(['/']);
                  return of(null);
                }),
              )
          : of(null),
      ),
    ),
    { initialValue: null as CategoryPage | null },
  );

  facets = computed<CategoryFacets>(
    () => this.data()?.facets ?? { brands: [], priceRange: { min: 0, max: 0 } },
  );
  priceFloor = computed(() => Math.floor(this.facets().priceRange.min));
  priceCeil = computed(() => Math.ceil(this.facets().priceRange.max));
  showFilters = computed(
    () => !this.isCoffret() && (this.facets().brands.length > 0 || this.facets().priceRange.max > 0),
  );

  category = computed<CategoryView>(() => {
    const c = this.data()?.category;
    return {
      name: c?.name ?? '',
      children: (c?.children ?? []).map((child) => ({ name: child.name, link: `/${child.slug}` })),
    };
  });

  breadcrumb = computed<BreadcrumbItem[]>(() =>
    (this.data()?.category.breadcrumb ?? []).map((b) => ({
      id: b.slug,
      name: b.name,
      link: `/${b.slug}`,
    })),
  );

  /** This category is the coffret landing page. */
  isCoffret = computed(() => this.catSlug() === 'coffret');

  /** Coffrets to show on the coffret category page. */
  bundles = toSignal(
    toObservable(this.catSlug).pipe(
      switchMap((slug) =>
        slug === 'coffret' ? this.catalog.bundles().pipe(catchError(() => of([] as Bundle[]))) : of([] as Bundle[]),
      ),
    ),
    { initialValue: [] as Bundle[] },
  );

  addBundle(bundle: Bundle): void {
    if (!bundle.inStock) {
      return;
    }
    this.cart.addBundle(bundle);
  }

  pageProducts = computed<Product[]>(() => this.data()?.products ?? []);
  totalProducts = computed(() => this.data()?.total ?? 0);
  totalPages = computed(() => Math.max(1, this.data()?.pages ?? 1));

  showingFrom = computed(() => (this.totalProducts() === 0 ? 0 : (this.page() - 1) * PAGE_SIZE + 1));
  showingTo = computed(() => Math.min(this.page() * PAGE_SIZE, this.totalProducts()));

  /** Page numbers with '…' gaps, like the original (1 2 3 … 6) */
  pageItems = computed<(number | '…')[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages = new Set<number>([1, total]);
    for (let p = current - 1; p <= current + 1; p++) {
      if (p >= 1 && p <= total) {
        pages.add(p);
      }
    }
    const sorted = [...pages].sort((a, b) => a - b);
    const items: (number | '…')[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
        items.push('…');
      }
      items.push(sorted[i]);
    }
    return items;
  });

  toggleSort(): void {
    this.sortOpen.update((open) => !open);
  }

  selectSort(key: string): void {
    this.sortOpen.set(false);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { order: key === 'product.position.asc' ? null : key, page: null },
      queryParamsHandling: 'merge',
    });
  }

  goToPage(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page === 1 ? null : page },
      queryParamsHandling: 'merge',
    });
  }

  setGrid(columns: number): void {
    this.gridColumns.set(columns);
  }

  toggleBrand(slug: string): void {
    const set = new Set(this.selectedBrands());
    if (set.has(slug)) {
      set.delete(slug);
    } else {
      set.add(slug);
    }
    this.applyFilters({ brands: set.size ? [...set].join(',') : null });
  }

  toggleStock(checked: boolean): void {
    this.applyFilters({ stock: checked ? '1' : null });
  }

  applyPrice(min: string, max: string): void {
    this.applyFilters({ min: min.trim() || null, max: max.trim() || null });
  }

  clearFilters(): void {
    this.applyFilters({ brands: null, min: null, max: null, stock: null });
  }

  private applyFilters(params: Record<string, string | null>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...params, page: null },
      queryParamsHandling: 'merge',
    });
  }
}

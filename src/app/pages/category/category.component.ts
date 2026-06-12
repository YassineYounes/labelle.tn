import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Product } from '../../data/site-data';
import { CategoryNode, getCategoryChain, getCategoryNode, getCategoryProducts } from '../../data/catalog';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

const PAGE_SIZE = 12;

interface SortOption {
  key: string;
  label: string;
  compare: ((a: Product, b: Product) => number) | null;
}

const SORT_OPTIONS: SortOption[] = [
  { key: 'product.sales.desc', label: 'Ventes, ordre décroissant', compare: null },
  { key: 'product.position.asc', label: 'Pertinence', compare: null },
  { key: 'product.name.asc', label: 'Nom, A à Z', compare: (a, b) => a.name.localeCompare(b.name) },
  { key: 'product.name.desc', label: 'Nom, Z à A', compare: (a, b) => b.name.localeCompare(a.name) },
  { key: 'product.price.asc', label: 'Prix, croissant', compare: (a, b) => parsePrice(a) - parsePrice(b) },
  { key: 'product.price.desc', label: 'Prix, décroissant', compare: (a, b) => parsePrice(b) - parsePrice(a) },
  { key: 'product.reference.asc', label: 'Reference, A to Z', compare: (a, b) => a.reference.localeCompare(b.reference) },
  { key: 'product.reference.desc', label: 'Reference, Z to A', compare: (a, b) => b.reference.localeCompare(a.reference) },
];

function parsePrice(p: Product): number {
  return parseFloat(p.price.replace(',', '.'));
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

  sortOptions = SORT_OPTIONS;
  sortOpen = signal(false);
  gridColumns = signal(3);

  private catSlug = toSignal(this.route.paramMap.pipe(map((params) => params.get('catSlug') ?? '')), {
    initialValue: '',
  });

  private queryParams = toSignal(this.route.queryParamMap, { initialValue: null });

  categoryId = computed(() => parseInt(this.catSlug(), 10));

  category = computed<CategoryNode>(() => {
    const node = getCategoryNode(this.categoryId());
    if (!node) {
      this.router.navigate(['/']);
      return { id: 0, name: '', link: '/', parentId: null, children: [] };
    }
    return node;
  });

  breadcrumb = computed(() => getCategoryChain(this.categoryId()));

  page = computed(() => {
    const raw = this.queryParams()?.get('page');
    const page = raw ? parseInt(raw, 10) : 1;
    return isNaN(page) || page < 1 ? 1 : page;
  });

  sortKey = computed(() => this.queryParams()?.get('order') ?? 'product.position.asc');

  sortLabel = computed(
    () => SORT_OPTIONS.find((o) => o.key === this.sortKey())?.label ?? 'Pertinence',
  );

  private allProducts = computed(() => {
    const products = [...getCategoryProducts(this.categoryId())];
    const compare = SORT_OPTIONS.find((o) => o.key === this.sortKey())?.compare;
    if (compare) {
      products.sort(compare);
    }
    return products;
  });

  totalProducts = computed(() => this.allProducts().length);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalProducts() / PAGE_SIZE)));

  pageProducts = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.allProducts().slice(start, start + PAGE_SIZE);
  });

  showingFrom = computed(() => (this.page() - 1) * PAGE_SIZE + 1);
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
}

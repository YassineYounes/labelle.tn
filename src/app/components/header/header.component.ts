import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { MenuItem, Product } from '../../data/site-data';
import { CartService, formatPrice, parsePrice } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { CatalogService } from '../../services/catalog.service';
import { AccountService } from '../../services/account.service';

/** Minimum characters before we ask the API for live suggestions. */
const MIN_SUGGEST_LEN = 2;

@Component({
  selector: 'app-header',
  imports: [RouterLink, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  menu: MenuItem[] = [];
  searchOpen = false;
  searchQuery = '';
  suggestions: Product[] = [];
  suggestLoading = false;
  mobileMenuOpen = false;
  expandedItems = new Set<string>();

  @ViewChild('searchInput') private searchInput?: ElementRef<HTMLInputElement>;

  cart = inject(CartService);
  wishlist = inject(WishlistService);
  account = inject(AccountService);
  private router = inject(Router);
  private catalog: CatalogService;
  private query$ = new Subject<string>();

  constructor(catalog: CatalogService) {
    this.catalog = catalog;
    catalog.menu().subscribe((menu) => (this.menu = menu));

    // Live suggestions: debounce keystrokes, then fetch a short result set.
    this.query$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((term) => {
          const q = term.trim();
          if (q.length < MIN_SUGGEST_LEN) {
            this.suggestLoading = false;
            return of([] as Product[]);
          }
          this.suggestLoading = true;
          return this.catalog.search(q, 1, 6).pipe(
            map((res) => res.products),
            catchError(() => of([] as Product[])),
          );
        }),
      )
      .subscribe((products) => {
        this.suggestions = products;
        this.suggestLoading = false;
      });
  }

  formatPrice = formatPrice;
  linePrice = (productPrice: string, qty: number) =>
    formatPrice(parseFloat(productPrice.replace(',', '.')) * qty);

  toggleSearch(): void {
    this.searchOpen ? this.closeSearch() : this.openSearch();
  }

  openSearch(): void {
    this.searchOpen = true;
    // Wait for the overlay to render, then focus the field.
    setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
  }

  closeSearch(): void {
    this.searchOpen = false;
    this.searchQuery = '';
    this.suggestions = [];
    this.suggestLoading = false;
  }

  onQueryChange(value: string): void {
    this.searchQuery = value;
    this.query$.next(value);
  }

  submitSearch(): void {
    const query = this.searchQuery.trim();
    if (query) {
      this.router.navigate(['/recherche'], { queryParams: { s: query } });
      this.closeSearch();
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleExpand(label: string): void {
    if (this.expandedItems.has(label)) {
      this.expandedItems.delete(label);
    } else {
      this.expandedItems.add(label);
    }
  }
}

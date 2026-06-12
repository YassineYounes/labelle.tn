import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MENU, MenuItem } from '../../data/site-data';
import { CartService, formatPrice, parsePrice } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  menu: MenuItem[] = MENU;
  searchOpen = false;
  searchQuery = '';
  mobileMenuOpen = false;
  expandedItems = new Set<string>();

  cart = inject(CartService);
  wishlist = inject(WishlistService);
  private router = inject(Router);

  formatPrice = formatPrice;
  linePrice = (productPrice: string, qty: number) =>
    formatPrice(parseFloat(productPrice.replace(',', '.')) * qty);

  toggleSearch(): void {
    this.searchOpen = !this.searchOpen;
  }

  submitSearch(): void {
    const query = this.searchQuery.trim();
    if (query) {
      this.searchOpen = false;
      this.router.navigate(['/recherche'], { queryParams: { s: query } });
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

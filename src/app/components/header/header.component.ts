import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MENU, MenuItem } from '../../data/site-data';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  menu: MenuItem[] = MENU;
  cartCount = 0;
  searchOpen = false;
  mobileMenuOpen = false;
  expandedItems = new Set<string>();

  toggleSearch(): void {
    this.searchOpen = !this.searchOpen;
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

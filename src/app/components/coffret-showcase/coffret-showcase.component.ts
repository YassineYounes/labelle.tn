import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Bundle, CatalogService } from '../../services/catalog.service';
import { CartService } from '../../services/cart.service';

/**
 * Home-page "Nos Coffrets" band: a horizontal slider of gift-set cards pulled
 * from the published coffrets, linking to each coffret's detail page with a
 * direct add-to-cart. Mirrors the product slider but uses the larger coffret
 * card. Hidden when there are no published coffrets.
 */
@Component({
  selector: 'app-coffret-showcase',
  imports: [RouterLink],
  templateUrl: './coffret-showcase.component.html',
  styleUrl: './coffret-showcase.component.css',
})
export class CoffretShowcaseComponent {
  @ViewChild('track') private track?: ElementRef<HTMLElement>;

  bundles = signal<Bundle[]>([]);

  private catalog = inject(CatalogService);
  private cart = inject(CartService);

  constructor() {
    this.catalog.bundles().subscribe((rows) => this.bundles.set(rows));
  }

  addBundle(b: Bundle): void {
    if (!b.inStock) {
      return;
    }
    this.cart.addBundle(b);
  }

  scroll(dir: -1 | 1): void {
    const el = this.track?.nativeElement;
    if (el) {
      el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
    }
  }
}

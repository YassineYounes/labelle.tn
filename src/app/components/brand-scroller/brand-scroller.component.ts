import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Brand, CatalogService } from '../../services/catalog.service';

/**
 * Home-page brand strip: a continuously scrolling list of brand logos + names,
 * each linking to that brand's products page. Brands and logos are managed in
 * the back-office (/api/shop/brands). The marquee duplicates the list so the
 * scroll loops seamlessly; it pauses on hover.
 */
@Component({
  selector: 'app-brand-scroller',
  imports: [RouterLink],
  templateUrl: './brand-scroller.component.html',
  styleUrl: './brand-scroller.component.css',
})
export class BrandScrollerComponent {
  brands = signal<Brand[]>([]);

  private catalog = inject(CatalogService);

  constructor() {
    this.catalog.brands().subscribe((brands) => this.brands.set(brands));
  }

  /** Initials fallback when a brand has no logo. */
  initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0))
      .join('')
      .toUpperCase();
  }
}

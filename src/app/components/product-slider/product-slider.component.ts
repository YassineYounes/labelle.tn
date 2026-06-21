import { Component, ElementRef, Input, OnInit, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../data/site-data';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CatalogService } from '../../services/catalog.service';

type Kind = 'new' | 'best' | 'promo';

/**
 * A titled horizontal slider of product cards for one home-page section
 * (new arrivals, best sellers, promotions). Cards scroll sideways instead of
 * wrapping, with prev/next arrows and a "see all" link to the full listing.
 */
@Component({
  selector: 'app-product-slider',
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './product-slider.component.html',
  styleUrl: './product-slider.component.css',
})
export class ProductSliderComponent implements OnInit {
  @Input({ required: true }) kind!: Kind;
  @Input({ required: true }) title!: string;
  /** Route to the full listing page for this section. */
  @Input({ required: true }) seeAllLink!: string;

  @ViewChild('track') private track?: ElementRef<HTMLElement>;

  products = signal<Product[]>([]);

  private catalog = inject(CatalogService);

  ngOnInit(): void {
    this.catalog.listing(this.kind, 1, 12).subscribe((res) => this.products.set(res.products));
  }

  scroll(dir: -1 | 1): void {
    const el = this.track?.nativeElement;
    if (el) {
      el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
    }
  }
}

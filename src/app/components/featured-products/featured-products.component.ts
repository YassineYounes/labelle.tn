import { Component } from '@angular/core';
import { Product } from '../../data/site-data';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-featured-products',
  imports: [ProductCardComponent],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.css',
})
export class FeaturedProductsComponent {
  products: Product[] = [];

  constructor(catalog: CatalogService) {
    catalog.featured(8).subscribe((products) => (this.products = products));
  }
}

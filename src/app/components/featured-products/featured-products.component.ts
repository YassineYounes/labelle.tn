import { Component } from '@angular/core';
import { PRODUCTS, Product } from '../../data/site-data';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-featured-products',
  imports: [ProductCardComponent],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.css',
})
export class FeaturedProductsComponent {
  products: Product[] = PRODUCTS;
}

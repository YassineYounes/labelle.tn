import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRODUCTS, Product } from '../../data/site-data';

@Component({
  selector: 'app-featured-products',
  imports: [RouterLink],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.css',
})
export class FeaturedProductsComponent {
  products: Product[] = PRODUCTS;
}

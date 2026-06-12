import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService, formatPrice, parsePrice } from '../../services/cart.service';
import { CartLine } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  cart = inject(CartService);
  formatPrice = formatPrice;

  lineTotal(line: CartLine): string {
    return formatPrice(parsePrice(line.product) * line.quantity);
  }
}

import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartLine, CartService, formatPrice } from '../../services/cart.service';

const GOVERNORATES = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba', 'Kairouan',
  'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'La Manouba', 'Médenine', 'Monastir', 'Nabeul',
  'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan',
];

interface OrderRecap {
  reference: string;
  lines: CartLine[];
  total: string;
  name: string;
  address: string;
}

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
  cart = inject(CartService);
  formatPrice = formatPrice;
  governorates = GOVERNORATES;

  name = '';
  phone = '';
  address = '';
  governorate = '';
  note = '';

  order = signal<OrderRecap | null>(null);

  submit(): void {
    if (!this.name.trim() || !this.phone.trim() || !this.address.trim() || !this.governorate) {
      return;
    }
    this.order.set({
      reference: 'LB' + Date.now().toString().slice(-8),
      lines: this.cart.lines(),
      total: formatPrice(this.cart.total()),
      name: this.name,
      address: `${this.address}, ${this.governorate}`,
    });
    this.cart.clear();
  }
}

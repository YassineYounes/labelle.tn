import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { CartLine, CartService, formatPrice } from '../../services/cart.service';
import { CheckoutService, DeliveryZone, OrderConfirmation } from '../../services/checkout.service';
import { AccountService } from '../../services/account.service';

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
  private checkout = inject(CheckoutService);
  private account = inject(AccountService);
  formatPrice = formatPrice;

  zones = toSignal(this.checkout.deliveryZones().pipe(catchError(() => of([] as DeliveryZone[]))), {
    initialValue: [] as DeliveryZone[],
  });

  firstName = '';
  lastName = '';
  phone = '';
  email = '';
  address = '';
  city = '';
  zoneId = signal<number | null>(null);
  note = '';

  submitting = signal(false);
  error = signal<string | null>(null);
  order = signal<OrderRecap | null>(null);

  constructor() {
    // Prefill the form from the logged-in customer's profile (only fills
    // fields the visitor hasn't already typed into).
    effect(() => {
      const profile = this.account.user();
      if (!profile) {
        return;
      }
      if (!this.firstName) this.firstName = profile.firstName;
      if (!this.lastName) this.lastName = profile.lastName;
      if (!this.phone) this.phone = profile.phone;
      if (!this.email && profile.email) this.email = profile.email;
      if (!this.address && profile.address) this.address = profile.address;
    });
  }

  /** Fee for the selected zone, waived over the free-delivery threshold (matches the cart). */
  deliveryFee = computed<number | null>(() => {
    const zone = this.zones().find((z) => z.id === this.zoneId());
    if (!zone) {
      return null;
    }
    return this.cart.subtotal() >= 300 ? 0 : zone.fee;
  });

  total = computed(() => this.cart.subtotal() + (this.deliveryFee() ?? 0));

  selectedZoneName = computed(() => this.zones().find((z) => z.id === this.zoneId())?.name ?? '');

  submit(): void {
    this.error.set(null);
    const zoneId = this.zoneId();
    if (
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.phone.trim() ||
      !this.address.trim() ||
      !zoneId
    ) {
      this.error.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    this.submitting.set(true);
    const lines = this.cart.lines();
    this.checkout
      .placeOrder({
        customer: {
          firstName: this.firstName.trim(),
          lastName: this.lastName.trim(),
          phone: this.phone.trim(),
          email: this.email.trim() || undefined,
        },
        shipping: {
          zoneId,
          city: this.city.trim() || undefined,
          address: this.address.trim(),
        },
        items: lines.map((line) => ({ id: line.product.id, quantity: line.quantity })),
        comment: this.note.trim() || undefined,
      })
      .pipe(
        catchError((err) => {
          this.error.set(err?.error?.error ?? 'Une erreur est survenue. Veuillez réessayer.');
          this.submitting.set(false);
          return of(null as OrderConfirmation | null);
        }),
      )
      .subscribe((confirmation) => {
        if (!confirmation) {
          return;
        }
        this.order.set({
          reference: confirmation.reference,
          lines,
          total: formatPrice(confirmation.total),
          name: `${this.firstName} ${this.lastName}`.trim(),
          address: `${this.address}, ${this.selectedZoneName()}`,
        });
        this.cart.clear();
        this.submitting.set(false);
      });
  }
}

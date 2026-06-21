import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { CartLine, CartService, formatPrice } from '../../services/cart.service';
import { CheckoutService, DeliveryZone, OrderConfirmation, QuoteResult } from '../../services/checkout.service';
import { AccountService } from '../../services/account.service';
import { ConfigService } from '../../services/config.service';

interface OrderRecap {
  reference: string;
  lines: CartLine[];
  total: string;
  discount: number;
  couponCode: string | null;
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
  config = inject(ConfigService);
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
  paymentMethod = 'cod';
  acceptTerms = false;

  couponCode = '';
  applyingCoupon = signal(false);
  couponError = signal<string | null>(null);
  appliedCode = signal<string | null>(null);
  discount = signal(0);

  submitting = signal(false);
  error = signal<string | null>(null);
  /** Set once the user submits, to highlight the missing required fields. */
  showErrors = signal(false);
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
    return this.cart.subtotal() >= this.config.freeShippingThreshold() ? 0 : zone.fee;
  });

  total = computed(() =>
    Math.max(0, this.cart.subtotal() - this.discount()) + (this.deliveryFee() ?? 0),
  );

  selectedZoneName = computed(() => this.zones().find((z) => z.id === this.zoneId())?.name ?? '');

  /** Cart lines as the checkout payload: coffrets send bundleId, products send id. */
  private cartItems(): { id?: number; bundleId?: number; quantity: number }[] {
    return this.cart.lines().map((line) =>
      line.product.isBundle
        ? { bundleId: line.product.bundleId, quantity: line.quantity }
        : { id: line.product.id, quantity: line.quantity },
    );
  }

  /** Validate the typed promo code server-side and apply (or report) it. */
  applyCoupon(): void {
    const code = this.couponCode.trim();
    this.couponError.set(null);
    if (!code) {
      this.clearCoupon();
      return;
    }

    this.applyingCoupon.set(true);
    this.checkout
      .quote({
        items: this.cartItems(),
        zoneId: this.zoneId(),
        couponCode: code,
      })
      .pipe(
        catchError(() => {
          this.couponError.set('Impossible de vérifier le code. Réessayez.');
          return of(null as QuoteResult | null);
        }),
      )
      .subscribe((result) => {
        this.applyingCoupon.set(false);
        if (!result) {
          return;
        }
        if (result.couponError) {
          this.couponError.set(result.couponError);
          this.clearCoupon();
          return;
        }
        this.discount.set(result.discount);
        this.appliedCode.set(result.couponCode);
      });
  }

  clearCoupon(): void {
    this.discount.set(0);
    this.appliedCode.set(null);
  }

  removeCoupon(): void {
    this.couponCode = '';
    this.couponError.set(null);
    this.clearCoupon();
  }

  submit(): void {
    this.error.set(null);
    this.showErrors.set(false);
    const zoneId = this.zoneId();
    if (
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.phone.trim() ||
      !this.address.trim() ||
      !this.city.trim() ||
      !zoneId
    ) {
      this.error.set('Veuillez remplir tous les champs obligatoires.');
      this.showErrors.set(true);
      return;
    }

    if (!this.acceptTerms) {
      this.error.set('Veuillez accepter les conditions générales de vente pour continuer.');
      this.showErrors.set(true);
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
          city: this.city.trim(),
          address: this.address.trim(),
        },
        items: this.cartItems(),
        comment: this.note.trim() || undefined,
        couponCode: this.appliedCode() ?? undefined,
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
          discount: confirmation.discount,
          couponCode: confirmation.couponCode,
          name: `${this.firstName} ${this.lastName}`.trim(),
          address: `${this.address}, ${this.selectedZoneName()}`,
        });
        this.cart.clear();
        this.submitting.set(false);
      });
  }
}

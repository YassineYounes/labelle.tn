import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService, OrderSummary } from '../../services/account.service';
import { formatPrice } from '../../services/cart.service';

@Component({
  selector: 'app-auth',
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  private account = inject(AccountService);
  formatPrice = formatPrice;

  isLoggedIn = this.account.isLoggedIn;
  user = this.account.user;

  mode = signal<'login' | 'register'>('login');
  accountTab = signal<'orders' | 'profile'>('orders');
  error = signal<string | null>(null);
  busy = signal(false);
  savedNotice = signal(false);

  orders = signal<OrderSummary[]>([]);
  ordersLoaded = signal(false);

  // login
  loginEmail = '';
  loginPassword = '';

  // register
  regFirstName = '';
  regLastName = '';
  regPhone = '';
  regEmail = '';
  regPassword = '';
  regAddress = '';

  // profile edit
  editFirstName = '';
  editLastName = '';
  editAddress = '';

  greeting = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}`.trim() : '';
  });

  setMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    this.error.set(null);
  }

  setTab(tab: 'orders' | 'profile'): void {
    this.accountTab.set(tab);
    this.savedNotice.set(false);
    if (tab === 'orders' && !this.ordersLoaded()) {
      this.loadOrders();
    }
    if (tab === 'profile') {
      const u = this.user();
      this.editFirstName = u?.firstName ?? '';
      this.editLastName = u?.lastName ?? '';
      this.editAddress = u?.address ?? '';
    }
  }

  login(): void {
    if (!this.loginEmail.trim() || !this.loginPassword) {
      this.error.set('Veuillez saisir votre e-mail et votre mot de passe.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.account.login(this.loginEmail.trim(), this.loginPassword).subscribe({
      next: () => {
        this.busy.set(false);
        this.afterLogin();
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(err?.status === 401 ? 'E-mail ou mot de passe incorrect.' : 'Connexion impossible.');
      },
    });
  }

  register(): void {
    if (
      !this.regFirstName.trim() ||
      !this.regLastName.trim() ||
      !this.regPhone.trim() ||
      !this.regEmail.trim() ||
      !this.regPassword
    ) {
      this.error.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.account
      .register({
        email: this.regEmail.trim(),
        password: this.regPassword,
        firstName: this.regFirstName.trim(),
        lastName: this.regLastName.trim(),
        phone: this.regPhone.trim(),
        address: this.regAddress.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.afterLogin();
        },
        error: (err) => {
          this.busy.set(false);
          this.error.set(err?.error?.error ?? 'Inscription impossible.');
        },
      });
  }

  saveProfile(): void {
    if (!this.editFirstName.trim() || !this.editLastName.trim()) {
      this.error.set('Nom et prénom sont obligatoires.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.account
      .updateProfile({
        firstName: this.editFirstName.trim(),
        lastName: this.editLastName.trim(),
        address: this.editAddress.trim(),
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.savedNotice.set(true);
        },
        error: () => {
          this.busy.set(false);
          this.error.set('Échec de la mise à jour.');
        },
      });
  }

  logout(): void {
    this.account.logout();
    this.orders.set([]);
    this.ordersLoaded.set(false);
    this.mode.set('login');
  }

  private afterLogin(): void {
    this.accountTab.set('orders');
    this.loadOrders();
  }

  private loadOrders(): void {
    this.account.orders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.ordersLoaded.set(true);
      },
      error: () => this.ordersLoaded.set(true),
    });
  }
}

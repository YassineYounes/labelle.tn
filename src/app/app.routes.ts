import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'content/1-livraison',
    loadComponent: () => import('./pages/delivery/delivery.component').then((m) => m.DeliveryComponent),
  },
  {
    path: 'content/3-termes-et-conditions-d-utilisation',
    loadComponent: () => import('./pages/terms/terms.component').then((m) => m.TermsComponent),
  },
  {
    path: 'nous-contacter',
    loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'plan-site',
    loadComponent: () => import('./pages/sitemap/sitemap.component').then((m) => m.SitemapComponent),
  },
  {
    path: 'panier',
    loadComponent: () => import('./pages/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'commande',
    loadComponent: () => import('./pages/checkout/checkout.component').then((m) => m.CheckoutComponent),
  },
  {
    path: 'recherche',
    loadComponent: () => import('./pages/search/search.component').then((m) => m.SearchComponent),
  },
  {
    path: 'nouveaux-produits',
    loadComponent: () => import('./pages/listing/listing.component').then((m) => m.ListingComponent),
    data: { kind: 'new' },
  },
  {
    path: 'meilleures-ventes',
    loadComponent: () => import('./pages/listing/listing.component').then((m) => m.ListingComponent),
    data: { kind: 'best' },
  },
  {
    path: 'promotions',
    loadComponent: () => import('./pages/listing/listing.component').then((m) => m.ListingComponent),
    data: { kind: 'promo' },
  },
  {
    path: 'liste-souhaits',
    loadComponent: () => import('./pages/wishlist/wishlist.component').then((m) => m.WishlistComponent),
  },
  {
    path: 'mon-compte',
    loadComponent: () => import('./pages/auth/auth.component').then((m) => m.AuthComponent),
  },
  { path: 'connexion', redirectTo: 'mon-compte' },
  { path: 'identite', redirectTo: 'mon-compte' },
  { path: 'historique-commandes', redirectTo: 'mon-compte' },
  { path: 'avoirs', redirectTo: 'mon-compte' },
  { path: 'adresses', redirectTo: 'mon-compte' },
  { path: 'reduction', redirectTo: 'mon-compte' },
  {
    path: 'marque/:slug',
    loadComponent: () => import('./pages/brand/brand.component').then((m) => m.BrandComponent),
  },
  {
    path: 'coffret-detail/:slug',
    loadComponent: () => import('./pages/coffret/coffret.component').then((m) => m.CoffretComponent),
  },
  {
    path: 'accueil/:slug',
    loadComponent: () => import('./pages/product/product.component').then((m) => m.ProductComponent),
  },
  {
    path: ':catSlug',
    loadComponent: () => import('./pages/category/category.component').then((m) => m.CategoryComponent),
  },
  { path: '**', redirectTo: '' },
];

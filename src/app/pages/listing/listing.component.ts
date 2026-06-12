import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PRODUCTS, Product } from '../../data/site-data';
import { CATALOG_PRODUCTS } from '../../data/catalog-data';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

export type ListingKind = 'new' | 'best' | 'promo';

interface ListingConfig {
  title: string;
  script: string;
  products: Product[];
  emptyMessage?: string;
}

const CONFIGS: Record<ListingKind, ListingConfig> = {
  new: {
    title: 'Nouveaux produits',
    script: 'Les dernières arrivées',
    products: [...CATALOG_PRODUCTS].sort((a, b) => b.id - a.id),
  },
  best: {
    title: 'Meilleures ventes',
    script: 'Les favoris de nos clientes',
    products: PRODUCTS,
  },
  promo: {
    title: 'Promotions',
    script: 'Nos bons plans',
    products: [],
    emptyMessage: "Il n'y a actuellement aucune promotion. Revenez bientôt !",
  },
};

@Component({
  selector: 'app-listing',
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.css',
})
export class ListingComponent {
  private route = inject(ActivatedRoute);

  private kind = toSignal(this.route.data.pipe(map((data) => data['kind'] as ListingKind)), {
    initialValue: 'new' as ListingKind,
  });

  config = computed(() => CONFIGS[this.kind()]);
}

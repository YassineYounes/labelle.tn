import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { Product } from '../../data/site-data';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { CatalogService } from '../../services/catalog.service';

export type ListingKind = 'new' | 'best' | 'promo';

interface ListingMeta {
  title: string;
  script: string;
  emptyMessage: string;
}

const META: Record<ListingKind, ListingMeta> = {
  new: {
    title: 'Nouveaux produits',
    script: 'Les dernières arrivées',
    emptyMessage: "Il n'y a pas encore de nouveaux produits. Revenez bientôt !",
  },
  best: {
    title: 'Meilleures ventes',
    script: 'Les favoris de nos clientes',
    emptyMessage: 'Aucune vente pour le moment.',
  },
  promo: {
    title: 'Promotions',
    script: 'Nos bons plans',
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
  private catalog = inject(CatalogService);

  private kind = toSignal(this.route.data.pipe(map((data) => data['kind'] as ListingKind)), {
    initialValue: 'new' as ListingKind,
  });

  private products = toSignal(
    toObservable(this.kind).pipe(
      switchMap((kind) => this.catalog.listing(kind, 1, 24).pipe(map((r) => r.products))),
    ),
    { initialValue: [] as Product[] },
  );

  config = computed(() => ({ ...META[this.kind()], products: this.products() }));
}

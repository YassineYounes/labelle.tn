import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { Product } from '../../data/site-data';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-search',
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent {
  private route = inject(ActivatedRoute);
  private catalog = inject(CatalogService);

  query = toSignal(this.route.queryParamMap.pipe(map((params) => params.get('s') ?? '')), {
    initialValue: '',
  });

  results = toSignal(
    toObservable(this.query).pipe(
      switchMap((q) => {
        const term = q.trim();
        return term.length < 2
          ? of([] as Product[])
          : this.catalog.search(term, 1, 48).pipe(map((r) => r.products));
      }),
    ),
    { initialValue: [] as Product[] },
  );
}

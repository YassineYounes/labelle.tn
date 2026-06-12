import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ALL_PRODUCTS } from '../../data/catalog';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

@Component({
  selector: 'app-search',
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent {
  private route = inject(ActivatedRoute);

  query = toSignal(this.route.queryParamMap.pipe(map((params) => params.get('s') ?? '')), {
    initialValue: '',
  });

  results = computed(() => {
    const q = normalize(this.query().trim());
    if (!q) {
      return [];
    }
    return ALL_PRODUCTS.filter((p) => normalize(p.name).includes(q));
  });
}
